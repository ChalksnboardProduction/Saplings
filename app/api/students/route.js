import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = 'SELECT * FROM students ORDER BY created_at DESC';
        const { rows } = await pool.query(query);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch data." },
            { status: 500 }
        );
    }
}
