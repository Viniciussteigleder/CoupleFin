type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

const toFirstName = (value: string) => value.trim().split(" ")[0];

export const buildCoupleName = (user: UserLike) => {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return `Conta de ${toFirstName(fullName)}`;
  }
  const displayName = user.user_metadata?.name;
  if (typeof displayName === "string" && displayName.trim()) {
    return `Conta de ${toFirstName(displayName)}`;
  }
  if (user.email) {
    return `Conta de ${user.email.split("@")[0]}`;
  }
  return "Conta individual";
};
