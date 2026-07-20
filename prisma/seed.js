require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcryptjs");

let prisma;

async function main() {
  const factory = new PrismaMariaDb(process.env.DATABASE_URL);
  prisma = new PrismaClient({ adapter: factory, log: ["query"] });
  
  // Seed permissions
  const defaultPermissions = [
    { name: "Dashboard View", slug: "dashboard" },
    { name: "Scanner Access", slug: "scanner" },
    { name: "Visitor Management", slug: "visitor" },
    { name: "Export Report", slug: "export" },
    { name: "Settings Management", slug: "setting" },
    { name: "Admin Management", slug: "admin" },
  ];

  console.log("Seeding permissions...");
  const permissionMap = {};
  for (const perm of defaultPermissions) {
    const created = await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name },
      create: { name: perm.name, slug: perm.slug },
    });
    permissionMap[perm.slug] = created.id;
  }

  // Seed default settings
  const defaultSettings = [
    {
      key: "event",
      value: JSON.stringify({
        name: "Malam Puncak Duta Genre Klaten 2026",
        logo: "",
        date: "2026-10-24",
        time: "18:00",
        location: "Pendopo Pemkab Klaten",
        mapsUrl: "https://maps.google.com/?q=Pendopo+Pemkab+Klaten",
        maxVisitors: 500,
        status: "OPEN"
      })
    },
    {
      key: "qr",
      value: JSON.stringify({
        prefix: "DGR26",
        format: "DGR26-XXXX-9999",
        logo: "",
        size: 256,
        color: "#4f46e5",
        expiredMinutes: 1440
      })
    },
    {
      key: "scanner",
      value: JSON.stringify({
        cooldown: 2,
        sound: true,
        vibration: true,
        fullscreen: false
      })
    },
    {
      key: "theme",
      value: JSON.stringify({
        primary: "#f97316",
        secondary: "#ef4444",
        accent: "#eab308",
        background: "#ffffff",
        text: "#000000"
      })
    },
    {
      key: "typography",
      value: JSON.stringify({
        headingFont: "Poppins",
        bodyFont: "Inter",
        headingSize: 32,
        bodySize: 16,
        headingSpacing: 0.5,
        bodySpacing: 0.2
      })
    },
    {
      key: "seo",
      value: JSON.stringify({
        metaTitle: "E-Ticketing Malam Puncak Duta Genre Klaten 2026",
        metaDescription: "Registrasi tiket masuk Malam Puncak Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.",
        ogImage: "",
        favicon: "",
        robots: "index, follow",
        canonical: "http://localhost:3000"
      })
    },
    {
      key: "announcement",
      value: JSON.stringify({
        enabled: false,
        text: "Registrasi Dibuka! Silakan daftarkan diri Anda."
      })
    },
    {
      key: "popup",
      value: JSON.stringify({
        enabled: false,
        title: "Selamat Datang!",
        text: "Selamat Datang di Pemilihan Duta Genre Klaten 2026.",
        image: "",
        buttonText: "Tutup",
        buttonLink: ""
      })
    },
    {
      key: "hero",
      value: JSON.stringify({
        title: "MALAM PUNCAK DUTA GENRE 2026",
        subtitle: "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten",
        description: "Selamat datang di portal e-ticketing resmi pengunjung Apresiasi & Pemilihan Duta Genre Klaten 2026. Silakan daftarkan diri Anda secara online untuk mendapatkan QR Code tiket masuk.",
        buttonText: "Daftar Sekarang",
        buttonLink: "/daftar",
        bgImage: "",
        bgVideo: "",
        overlay: 40,
        gradient: true,
        imagePosition: "center",
        enabled: true
      })
    }
  ];

  console.log("Seeding default system settings...");
  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value }
    });
  }

  // Seed default custom sections
  const defaultSections = [
    { name: "Hero", slug: "hero", order: 1, isVisible: true, content: JSON.stringify({ title: "Hero Section" }) },
    { name: "Tentang", slug: "tentang", order: 2, isVisible: true, content: JSON.stringify({ text: "Tentang Duta Genre Klaten..." }) },
    { name: "Rundown", slug: "rundown", order: 3, isVisible: true, content: JSON.stringify({ items: [] }) },
    { name: "Guest Star", slug: "guest-star", order: 4, isVisible: true, content: JSON.stringify({ stars: [] }) },
    { name: "Sponsor", slug: "sponsor", order: 5, isVisible: true, content: JSON.stringify({ sponsors: [] }) },
    { name: "FAQ", slug: "faq", order: 6, isVisible: false, content: JSON.stringify({ faqs: [] }) },
    { name: "Lokasi", slug: "lokasi", order: 7, isVisible: true, content: JSON.stringify({ mapUrl: "" }) },
    { name: "Footer", slug: "footer", order: 8, isVisible: true, content: JSON.stringify({ copyright: "© 2026 Duta Genre Kabupaten Klaten" }) },
  ];

  console.log("Seeding custom sections...");
  for (const sect of defaultSections) {
    await prisma.customSection.upsert({
      where: { slug: sect.slug },
      update: {},
      create: { name: sect.name, slug: sect.slug, order: sect.order, isVisible: sect.isVisible, content: sect.content }
    });
  }

  // Seed default form fields
  const defaultFields = [
    { label: "Nama Lengkap", fieldName: "full_name", fieldType: "text", required: true, placeholder: "Masukkan Nama Lengkap Anda", options: "", order: 1 },
    { label: "Jenis Kelamin", fieldName: "gender", fieldType: "select", required: true, placeholder: "Pilih Jenis Kelamin", options: "Laki-laki,Perempuan", order: 2 },
    { label: "Tanggal Lahir", fieldName: "birth_date", fieldType: "date", required: true, placeholder: "Pilih Tanggal Lahir", options: "", order: 3 },
    { label: "Alamat Lengkap", fieldName: "address", fieldType: "textarea", required: true, placeholder: "Masukkan Alamat Domisili", options: "", order: 4 },
  ];

  console.log("Seeding default form fields...");
  for (const field of defaultFields) {
    await prisma.formField.upsert({
      where: { fieldName: field.fieldName },
      update: {},
      create: {
        label: field.label,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        required: field.required,
        placeholder: field.placeholder,
        options: field.options,
        order: field.order
      }
    });
  }

  // Seed superadmin
  const superAdminUsername = "superadmin";
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: superAdminUsername },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const createdAdmin = await prisma.admin.create({
      data: {
        username: superAdminUsername,
        password_hash: hashedPassword,
        name: "Super Admin Duta Genre",
        role: "superadmin",
        status: "ACTIVE",
      },
    });

    console.log("Superadmin created. Mapping permissions...");
    // Map all permissions to superadmin
    for (const slug in permissionMap) {
      await prisma.adminPermission.create({
        data: {
          admin_id: createdAdmin.id,
          permission_id: permissionMap[slug],
        },
      });
    }

    console.log("Seeding completed successfully.");
  } else {
    console.log("Superadmin already exists. Assuring all permissions are mapped...");
    // Ensure existing superadmin has all permissions mapped
    for (const slug in permissionMap) {
      const exists = await prisma.adminPermission.findFirst({
        where: {
          admin_id: existingAdmin.id,
          permission_id: permissionMap[slug],
        },
      });
      if (!exists) {
        await prisma.adminPermission.create({
          data: {
            admin_id: existingAdmin.id,
            permission_id: permissionMap[slug],
          },
        });
      }
    }
    console.log("Superadmin check and permission sync completed.");
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
