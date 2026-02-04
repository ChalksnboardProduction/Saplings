import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            studentName,
            studentClass,
            parentName,
            phone,
            email,
            address
        } = body;

        // Insert data into PostgreSQL
        const query = `
            INSERT INTO students (student_name, class, parent_name, phone, email, address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [studentName, studentClass, parentName, phone, email, address];

        const { rows } = await pool.query(query, values);

        return NextResponse.json({ success: true, message: "Registration saved successfully!", data: rows[0] });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to save data. Please try again." },
            { status: 500 }
        );
    }
}
