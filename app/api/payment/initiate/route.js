import pool from "@/lib/db";
import { generateChecksum } from "@/lib/airpay";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { studentId } = await request.json();

        if (!studentId) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        // 1. Fetch student details
        const studentQuery = `SELECT * FROM students WHERE id = $1`;
        const { rows } = await pool.query(studentQuery, [studentId]);
        const student = rows[0];

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // 2. Prepare Payment Data
        const orderId = `ORD_${studentId}_${Date.now()}`;

        // Update student with order_id
        await pool.query(`UPDATE students SET order_id = $1 WHERE id = $2`, [orderId, studentId]);

        const merchantId = process.env.AIRPAY_MERCHANT_ID;
        const username = process.env.AIRPAY_USERNAME;
        const password = process.env.AIRPAY_PASSWORD;
        const secret = process.env.AIRPAY_SECRET;
        const apiKey = process.env.AIRPAY_API_KEY; // If needed separately
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Standard Airpay Parameters
        // Note: The specific fields required by Airpay might vary slightly based on the kit.
        // We follow standard fields found in general documentation.

        const params = {
            mercid: merchantId,
            orderid: orderId,
            currency: '356', // INR
            isocode: 'IND',
            amount: '1.00',
            email: student.email,
            phone: student.phone,
            firstname: student.student_name.split(' ')[0],
            lastname: student.student_name.split(' ').slice(1).join(' ') || '.',
            buyeraddress: student.address,
            buyerstate: 'Haryana', // Defaulting or should be in form
            buyercity: 'Gurgaon', // Defaulting or should be in form
            buyerpincode: '122011',
            buyerphone: student.phone,
            buyeremail: student.email,
            customvar: studentId, // Passing student ID for ref
            chmod: '', // Hidden Mode
            privatekey: '', // Will be calculated
            mer_dom: '',
        };

        // Calculate Checksum (Private Key)
        // Many Airpay implementations use a specific formula for 'privatekey'.
        // If 'generateChecksum' uses sorted values + date, we use that.
        // But often 'privatekey' is: sha256(secret + @ + username + :|: + password)
        // Let's assume the helper does the right thing or we adjust here.

        // Let's try to construct the private key here if the helper is generic.
        // Formula: sha256(secret + "@" + username + ":|:" + password)
        const crypto = require('crypto');
        const secret_key_str = `${secret}@${username}:|:${password}`;
        const privateKey = crypto.createHash('sha256').update(secret_key_str).digest('hex');

        params.privatekey = privateKey;

        // Now generate the FINAL checksum for the request
        const checksum = generateChecksum(params, apiKey);

        // Return params to frontend to submit form
        return NextResponse.json({
            success: true,
            params: {
                ...params,
                checksum: checksum
            },
            action: 'https://payments.airpay.co.in/pay/index.php'
        });

    } catch (error) {
        console.error("Payment Initiation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
