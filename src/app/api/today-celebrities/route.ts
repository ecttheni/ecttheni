import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    type MemberRow = {
      id: string;
      fullName: string;
      mobile: string | null;
      company: string | null;
      location: string | null;
      photoUrl: string | null;
      slug: string | null;
    };

    const birthdays = await prisma.$queryRaw<MemberRow[]>`
      SELECT
        u.id,
        md.fullName,
        md.mobile,
        md.company,
        md.location,
        md.photoUrl,
        u.slug
      FROM user u
      INNER JOIN memberdetail md ON md.userId = u.id
      WHERE
        DAY(md.dateOfBirth) = ${day}
        AND MONTH(md.dateOfBirth) = ${month}
        AND u.status = 'ACTIVE'
        AND u.role = 'MEMBER'
      ORDER BY md.fullName ASC
    `;

    const marriages = await prisma.$queryRaw<MemberRow[]>`
      SELECT
        u.id,
        md.fullName,
        md.mobile,
        md.company,
        md.location,
        md.photoUrl,
        u.slug
      FROM user u
      INNER JOIN memberdetail md ON md.userId = u.id
      WHERE
        DAY(md.dateOfAnniversary) = ${day}
        AND MONTH(md.dateOfAnniversary) = ${month}
        AND u.status = 'ACTIVE'
        AND u.role = 'MEMBER'
      ORDER BY md.fullName ASC
    `;

    return NextResponse.json({
      birthday_count: birthdays.length,
      married_count: marriages.length,
      birthdays,
      marriages,
    });
  } catch (error) {
    console.error("Error fetching today celebrities:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's celebrities" },
      { status: 500 }
    );
  }
}
