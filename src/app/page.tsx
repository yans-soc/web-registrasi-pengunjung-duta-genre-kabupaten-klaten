import { prisma } from "@/lib/prisma";
import ClientHome from "./components/ClientHome";

export const revalidate = 0; // Ensure live data on visits

export default async function Home() {
  // 1. Fetch all settings
  const settingsList = await prisma.systemSetting.findMany();
  const settingsMap: Record<string, string> = {};
  settingsList.forEach((s: any) => {
    settingsMap[s.key] = s.value;
  });

  // Parse sections
  let theme = {
    primary: "#EA580C",
    secondary: "#DC2626",
    accent: "#F59E0B",
    background: "#FFF8F2",
    text: "#111827",
  };
  let typography = {
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
  };
  let hero = {
    enabled: true,
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    bgImage: "",
    overlay: 50,
  };
  let popup = {
    enabled: false,
    title: "",
    text: "",
    image: "",
    buttonText: "",
    buttonLink: "",
  };
  let announcement = {
    enabled: false,
    text: "",
  };

  try {
    if (settingsMap.theme) theme = JSON.parse(settingsMap.theme);
  } catch (e) {}
  try {
    if (settingsMap.typography) typography = JSON.parse(settingsMap.typography);
  } catch (e) {}
  try {
    if (settingsMap.hero) hero = JSON.parse(settingsMap.hero);
  } catch (e) {}
  try {
    if (settingsMap.popup) popup = JSON.parse(settingsMap.popup);
  } catch (e) {}
  try {
    if (settingsMap.announcement) announcement = JSON.parse(settingsMap.announcement);
  } catch (e) {}

  // 2. Fetch all custom sections
  const customSectionsRaw = await prisma.customSection.findMany({
    orderBy: { order: "asc" },
  });

  const customSections = customSectionsRaw.map((sect: any) => {
    let parsedContent = null;
    try {
      if (sect.content) {
        parsedContent = JSON.parse(sect.content);
      }
    } catch (e) {}
    return {
      ...sect,
      content: parsedContent,
    };
  });

  // 3. Fetch real-time stats
  const totalRegistered = await prisma.visitor.count();
  const totalCheckedIn = await prisma.visitor.count({
    where: { status: "CHECKED_IN" },
  });

  const percentagePresent =
    totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  const stats = {
    totalRegistered,
    totalCheckedIn,
    percentagePresent,
  };

  return (
    <ClientHome
      theme={theme}
      typography={typography}
      hero={hero}
      popup={popup}
      announcement={announcement}
      sections={customSections}
      stats={stats}
    />
  );
}
