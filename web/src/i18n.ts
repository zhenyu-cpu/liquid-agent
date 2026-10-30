import { useStore } from "./store";

export type Language = "en" | "zh" | "es" | "fr";

const DICT: Record<Language, Record<string, string>> = {
  en: {
    "settings.title": "Settings",
    "settings.tab.general": "General",
    "settings.tab.voice": "Voice",
    "settings.tab.safety": "Safety",
    "settings.tab.downloads": "Downloads",
    "settings.tab.advanced": "Advanced",
    "general.title": "General",
    "general.name": "Your name",
    "general.name.detail": "Used to greet you.",
    "general.name.placeholder": "Your first name",
    "general.personality": "Personality",
    "general.personality.detail": "How Liquid Agent talks to you.",
    "general.personality.friendly": "Friendly",
    "general.personality.concise": "Short and to the point",
    "general.personality.playful": "Playful",
    "general.personality.professional": "Professional",
    "general.think": "Think before answering",
    "general.think.detail":
      "LFM3 1.7B works it out first, then answers. Slower, but much better answers. LFM3 Omni 2B can't think, so pictures and audio are answered right away. Also under the message box.",
    "general.appearance": "Appearance",
    "general.home": "Home folder for files",
    "general.home.detail": "Where it reads and saves files when you don't give a full path.",
    "general.notifications": "Notifications",
    "general.notifications.detail": "Tell me when an answer is ready or needs your OK while this tab is in the background.",
    "general.language": "Language",
    "general.language.detail": "Interface language used in settings and other screens as translations are added.",
  },
  zh: {
    "settings.title": "设置",
    "settings.tab.general": "通用",
    "settings.tab.voice": "语音",
    "settings.tab.safety": "安全",
    "settings.tab.downloads": "下载",
    "settings.tab.advanced": "高级",
    "general.title": "通用",
    "general.name": "你的名称",
    "general.name.detail": "用于向你问候。",
    "general.name.placeholder": "你的名字",
    "general.personality": "性格",
    "general.personality.detail": "Liquid Agent 与你交谈的方式。",
    "general.personality.friendly": "友好",
    "general.personality.concise": "简短直接",
    "general.personality.playful": "活泼",
    "general.personality.professional": "专业",
    "general.think": "回答前先思考",
    "general.think.detail":
      "LFM3 1.7B 会先推导再回答。更慢，但通常质量更好。LFM3 Omni 2B 无法思考，因此图片和音频会立即回答。消息框下方也有此选项。",
    "general.appearance": "外观",
    "general.home": "文件默认目录",
    "general.home.detail": "未指定完整路径时，读取和保存文件的位置。",
    "general.notifications": "通知",
    "general.notifications.detail": "当标签页在后台时，有答案就绪或需要你确认时通知你。",
    "general.language": "语言",
    "general.language.detail": "界面语言。随着翻译逐步完善，更多界面会使用此设置。",
  },
  es: {},
  fr: {},
};

export function useLanguage(): Language {
  const code = useStore((s) => s.settings?.language);
  return code === "en" || code === "zh" || code === "es" || code === "fr" ? code : "en";
}

export function t(key: string, language: Language = useLanguage()): string {
  return (DICT[language] ? DICT[language][key] : undefined) ?? DICT.en[key] ?? key;
}
