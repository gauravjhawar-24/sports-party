import { redirect } from "next/navigation";

type JoinCodePageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function JoinCodePage({
  searchParams,
}: JoinCodePageProps) {
  const { code = "" } = await searchParams;
  const inviteCode = cleanInviteCode(code);

  if (inviteCode) {
    redirect(`/f1/join/${inviteCode}`);
  }

  redirect("/f1");
}

function cleanInviteCode(value: string) {
  const trimmed = value.trim();
  const urlMatch = trimmed.match(/\/f1\/join\/([^/?#]+)/i);
  if (urlMatch?.[1])
    return urlMatch[1]
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  const lastToken = trimmed.split(/\s+/).at(-1) ?? trimmed;
  return lastToken
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
