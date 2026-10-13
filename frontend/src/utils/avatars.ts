export const AVATARS = ["man", "woman", "helicopter"] as const;

export function avatarSrc(avatar: string | undefined): string {
  return `/avatars/${AVATARS.includes(avatar as (typeof AVATARS)[number]) ? avatar : "helicopter"}.png`;
}

export const AVATAR_LABELS: Record<(typeof AVATARS)[number], string> = {
  man: "Mężczyzna",
  woman: "Kobieta",
  helicopter: "Helikopter",
};
