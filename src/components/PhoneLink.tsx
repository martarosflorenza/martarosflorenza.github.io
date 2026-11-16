import { useMediaQuery } from "../lib/hooks";

/**
 * A phone number that starts a call on phones and tablets. On computers, which usually
 * cannot place calls (the link only opens an app picker or does nothing), it is plain text
 * that can be selected and copied.
 */
export function PhoneLink({ phone }: { phone: string }) {
  const canCall = !useMediaQuery("(hover: hover) and (pointer: fine)");
  if (!canCall) return <span>{phone}</span>;
  return (
    <a className="link-line" href={`tel:${phone.replace(/\s/g, "")}`}>
      {phone}
    </a>
  );
}
