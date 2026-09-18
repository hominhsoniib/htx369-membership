/**
 * Seed script — Phase 2 Database
 * Mục tiêu số lượng (theo Implementation Plan §1 Definition of Done):
 *   1 Organization · 5 Territory · 15 Chapter · 300 Member · 50 Leader
 *   150 Guest · 30 Event
 *
 * Chạy: `npx prisma db seed` (khai báo "prisma.seed" trong package.json)
 * Dùng batch insert (createMany) thay vì loop từng record để tránh chậm.
 */

import { PrismaClient, SystemRole, MemberStatus, GuestStatus, EventStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Mật khẩu demo DÙNG CHUNG cho mọi tài khoản seed — chỉ dùng ở môi trường dev/staging.
// KHÔNG bao giờ seed tài khoản với mật khẩu này ở production.
const DEMO_PASSWORD = "Demo@12345";

const SURNAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"];
const MIDDLE_NAMES = ["Văn", "Thị", "Hữu", "Đức", "Minh", "Thanh", "Quốc", "Ngọc", "Kim", "Xuân"];
const GIVEN_NAMES = ["An", "Bình", "Cường", "Dũng", "Giang", "Hà", "Hùng", "Khang", "Lan", "Mai", "Nam", "Oanh", "Phúc", "Quân", "Sơn", "Thảo", "Uyên", "Việt", "Yến", "Trang"];

function generateFullName(i: number) {
  return `${SURNAMES[i % SURNAMES.length]} ${MIDDLE_NAMES[(i * 3) % MIDDLE_NAMES.length]} ${GIVEN_NAMES[(i * 7) % GIVEN_NAMES.length]}`;
}

async function main() {
  // 1) Organization
  const org = await prisma.organization.create({
    data: {
      name: "Vietnam Business Networking Alliance",
      email: "contact@example-org.vn",
      isActive: true,
    },
  });

  // 2) Industries (danh mục dùng chung)
  const industryNames = [
    "Bất động sản", "Tài chính - Ngân hàng", "Công nghệ thông tin", "Giáo dục",
    "Y tế - Sức khỏe", "F&B", "Sản xuất", "Xây dựng", "Marketing - Truyền thông", "Logistics",
  ];
  await prisma.industry.createMany({
    data: industryNames.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const industries = await prisma.industry.findMany();

  // 3) Territories (5)
  const territoryNames = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
  const territories = [];
  for (let i = 0; i < territoryNames.length; i++) {
    const t = await prisma.territory.create({
      data: {
        organizationId: org.id,
        name: territoryNames[i],
        code: `T${String(i + 1).padStart(2, "0")}`,
        isActive: true,
      },
    });
    territories.push(t);
  }

  // 4) Chapters (15 — 3 chapter/territory)
  const chapters = [];
  for (const territory of territories) {
    for (let c = 1; c <= 3; c++) {
      const chapter = await prisma.chapter.create({
        data: {
          territoryId: territory.id,
          name: `${territory.name} Chapter ${c}`,
          code: `${territory.code}-C${c}`,
          isActive: true,
        },
      });
      chapters.push(chapter);
    }
  }

  // 5) Demo accounts — 5 role (Phase 3 Authentication cần dữ liệu thật để test login/RBAC)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const firstTerritory = territories[0];
  const firstChapter = chapters[0];

  const superAdmin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "superadmin@demo.local",
      passwordHash,
      fullName: "Super Admin Demo",
      role: SystemRole.SUPER_ADMIN,
    },
  });

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "admin@demo.local",
      passwordHash,
      fullName: "Admin Demo",
      role: SystemRole.ADMIN,
    },
  });

  const regionalLeaderUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "regional.leader@demo.local",
      passwordHash,
      fullName: "Regional Leader Demo",
      role: SystemRole.REGIONAL_LEADER,
    },
  });
  await prisma.territoryLeader.create({
    data: { territoryId: firstTerritory.id, userId: regionalLeaderUser.id, title: "PRESIDENT" },
  });

  const chapterLeaderUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "chapter.leader@demo.local",
      passwordHash,
      fullName: "Chapter Leader Demo",
      role: SystemRole.CHAPTER_LEADER,
    },
  });
  await prisma.chapterLeader.create({
    data: { chapterId: firstChapter.id, userId: chapterLeaderUser.id, title: "PRESIDENT" },
  });

  const memberUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "member@demo.local",
      passwordHash,
      fullName: "Member Demo",
      role: SystemRole.MEMBER,
    },
  });
  await prisma.member.create({
    data: {
      userId: memberUser.id,
      territoryId: firstTerritory.id,
      chapterId: firstChapter.id,
      memberCode: "MB-DEMO-0001",
      fullName: "Member Demo",
      email: "member@demo.local",
      phone: "0900000000",
      status: MemberStatus.ACTIVE,
    },
  });

  console.log("Demo accounts:", {
    superAdmin: superAdmin.email,
    admin: admin.email,
    regionalLeader: regionalLeaderUser.email,
    chapterLeader: chapterLeaderUser.email,
    member: memberUser.email,
    password: DEMO_PASSWORD,
  });

  // 6) Member (300) — phân bổ đều theo 15 chapter, random industry, tỉ lệ trạng thái
  // thực tế (đa số ACTIVE), trải joinedAt trong 24 tháng gần nhất. Batch insert theo
  // lô 50 bằng createMany — KHÔNG loop insert từng dòng (Rule performance §28/§32).
  const MEMBER_COUNT = 300;
  const BATCH_SIZE = 50;
  let memberSeq = 1;

  for (let batchStart = 0; batchStart < MEMBER_COUNT; batchStart += BATCH_SIZE) {
    const batch = [];
    const batchEnd = Math.min(batchStart + BATCH_SIZE, MEMBER_COUNT);

    for (let i = batchStart; i < batchEnd; i++) {
      const chapter = chapters[i % chapters.length];
      const industry = industries[i % industries.length];
      const status: MemberStatus =
        i % 37 === 0 ? MemberStatus.LEFT : i % 20 === 0 ? MemberStatus.SUSPENDED : MemberStatus.ACTIVE;
      const monthsAgo = i % 24;
      const joinedAt = new Date();
      joinedAt.setMonth(joinedAt.getMonth() - monthsAgo);

      batch.push({
        territoryId: chapter.territoryId,
        chapterId: chapter.id,
        industryId: industry.id,
        memberCode: `HV-${String(memberSeq).padStart(6, "0")}`,
        fullName: generateFullName(i),
        email: `member${memberSeq}@seed.local`,
        phone: `09${String(10000000 + memberSeq).padStart(8, "0")}`,
        company: `Công ty TNHH ${generateFullName(i).split(" ").pop()} ${i}`,
        joinedAt,
        status,
      });
      memberSeq++;
    }

    await prisma.member.createMany({ data: batch, skipDuplicates: true });
  }

  console.log(`Seeded ${MEMBER_COUNT} members.`);

  // Fetch created members for relations
  const seededMembers = await prisma.member.findMany({ take: 100 });

  // 8) Guests (150)
  const GUEST_COUNT = 150;
  const guestStatuses: GuestStatus[] = [
    GuestStatus.REGISTERED,
    GuestStatus.CONFIRMED,
    GuestStatus.ATTENDED,
    GuestStatus.NO_SHOW,
    GuestStatus.FOLLOW_UP,
    GuestStatus.JOINED,
  ];

  const guestBatch = [];
  for (let i = 0; i < GUEST_COUNT; i++) {
    const chapter = chapters[i % chapters.length];
    const industry = industries[i % industries.length];
    const referrer = seededMembers[i % seededMembers.length];
    const status = guestStatuses[i % guestStatuses.length];

    guestBatch.push({
      territoryId: chapter.territoryId,
      chapterId: chapter.id,
      industryId: industry.id,
      referrerMemberId: referrer.id,
      fullName: `Khách Mời ${generateFullName(i)}`,
      phone: `08${String(10000000 + i).padStart(8, "0")}`,
      email: `guest${i + 1}@demo.local`,
      company: `Doanh Nghiệp KM ${i + 1}`,
      position: i % 2 === 0 ? "Giám đốc" : "Quản lý Kinly",
      source: "member_referral",
      status,
      notes: "Quan tâm đến mạng lưới kết nối giao thương",
    });
  }

  await prisma.guest.createMany({ data: guestBatch, skipDuplicates: true });
  console.log(`Seeded ${GUEST_COUNT} guests.`);

  // 9) Events (30)
  const events = [];
  const eventStatuses: EventStatus[] = [EventStatus.UPCOMING, EventStatus.ONGOING, EventStatus.COMPLETED, EventStatus.DRAFT];

  for (let i = 1; i <= 30; i++) {
    const chapter = chapters[i % chapters.length];
    const monthsDiff = (i % 6) - 3; // past and future events
    const startAt = new Date();
    startAt.setMonth(startAt.getMonth() + monthsDiff);
    startAt.setHours(7, 0, 0, 0);

    const endAt = new Date(startAt);
    endAt.setHours(10, 0, 0, 0);

    const status = monthsDiff < 0 ? EventStatus.COMPLETED : monthsDiff === 0 ? EventStatus.ONGOING : EventStatus.UPCOMING;

    const event = await prisma.event.create({
      data: {
        organizationId: org.id,
        territoryId: chapter.territoryId,
        chapterId: chapter.id,
        title: `Họp Mặt Networking ${chapter.name} #${i}`,
        slug: `hop-mat-networking-${chapter.code.toLowerCase()}-${i}`,
        description: `Buổi họp mặt tuần nhằm trao đổi cơ hội kinh doanh và kết nối hội viên tại ${chapter.name}.`,
        startAt,
        endAt,
        location: `Khách sạn Grand, ${chapter.name}`,
        capacity: 50,
        status,
        registrationEnabled: true,
        organizerUserId: superAdmin.id,
      },
    });
    events.push(event);

    // Create 10 registrations & 6 check-ins per event
    for (let r = 1; r <= 10; r++) {
      const regCode = `REG-${String(i * 100 + r).padStart(6, "0")}`;
      const reg = await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          fullName: `Người Đăng Ký ${i}-${r}`,
          phone: `098${String(i * 1000 + r).padStart(7, "0")}`,
          email: `event_user_${i}_${r}@demo.local`,
          company: `Công Ty Đăng Ký ${r}`,
          code: regCode,
        },
      });

      if (r <= 6 && (status === EventStatus.COMPLETED || status === EventStatus.ONGOING)) {
        await prisma.eventCheckIn.create({
          data: {
            eventId: event.id,
            registrationId: reg.id,
          },
        });
      }
    }
  }

  console.log(`Seeded ${events.length} events with registrations & check-ins.`);

  // 10) AuditLogs (20)
  const auditBatch = [
    { userId: superAdmin.id, action: "CREATE", entity: "Organization", entityId: org.id, newValue: { name: org.name } },
    { userId: admin.id, action: "LOGIN", entity: "User", entityId: admin.id, newValue: { email: admin.email } },
    { userId: chapterLeaderUser.id, action: "CREATE", entity: "Member", entityId: seededMembers[0]?.id || "m1" },
    { userId: regionalLeaderUser.id, action: "UPDATE", entity: "Territory", entityId: firstTerritory.id },
  ];

  for (const log of auditBatch) {
    await prisma.auditLog.create({ data: log as any });
  }

  console.log(`Seeded audit logs.`);
  console.log(`Seeded complete dataset successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

