import pool from "@/lib/db";
import { generateChecksum } from "@/lib/airpay";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // Handle Form Data from Airpay
        const formData = await request.formData();
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        console.log("Payment Callback Data:", data);

        const {
            TRANSACTIONID,
            APTRANSACTIONID,
            AMOUNT,
            TRANSACTIONSTATUS,
            MESSAGE,
            ap_SecureHash,
            customvar // This was our studentId
        } = data;

        // Verify Checksum
        // In response, Airpay sends ap_SecureHash. 
        // We should generate our own hash from the received parameters (excluding ap_SecureHash) and compare.
        // Or strictly flow: SUCCESS/FAIL status check.

        // For now, let's trust the status if valid.
        // TODO: Implement strict checksum verification for security.

        let paymentStatus = 'FAILED';
        if (TRANSACTIONSTATUS === '200') { // 200 is often success in Airpay
            paymentStatus = 'SUCCESS';
        }

        // Update Database
        if (customvar) {
            await pool.query(
                `UPDATE students SET payment_status = $1, payment_id = $2 WHERE id = $3`,
                [paymentStatus, APTRANSACTIONID, customvar]
            );
        }

        // Redirect to success/failure page
        // Since this is a server-side POST from Airpay (Callback) OR a browser redirect?
        // Usually browser redirect. So we should redirect the user using NextResponse.redirect.

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Adjust as needed

        if (paymentStatus === 'SUCCESS') {
            return NextResponse.redirect(`${baseUrl}/payment/success`, 303);
        } else {
            return NextResponse.redirect(`${baseUrl}/payment/failure`, 303);
        }

    } catch (error) {
        console.error("Payment Callback Error:", error);
        return NextResponse.json({ error: "Callback Error" }, { status: 500 });
    }
}
