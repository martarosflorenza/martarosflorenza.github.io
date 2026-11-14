import { useState } from "react";
import { profile } from "../content";
import { Page } from "../components/PageTransition";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { Footer } from "../components/Footer";
import "./info.css";

export function Info() {
  const { email, instagram, phone } = profile.contact;
  const [first, ...rest] = profile.bio.split(/(?<=\.)\s+/);
  return (
    <Page title={`Info — ${profile.name}`}>
      <div className="info grid">
        <div className="info-text">
          <h1 className="sr-only">About {profile.name}</h1>
          <p className="serif info-lead">{first}</p>
          <p className="info-body">{rest.join(" ")}</p>

          <Reveal className="info-block">
            <h2 className="small soft">contact</h2>
            <ul className="info-contact">
              <li>
                <a className="link-line" href={`mailto:${email}`}>{email}</a>
                <CopyButton text={email} />
              </li>
              <li><a className="link-line" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">instagram @{instagram}</a></li>
              <li><a className="link-line" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>
              <li className="soft">{profile.location.toLowerCase()}</li>
            </ul>
          </Reveal>

          <Reveal className="info-block info-clients">
            <h2 className="small soft">selected clients</h2>
            <p className="serif italic">{profile.clients.join(", ")}.</p>
          </Reveal>

          <Reveal className="info-portrait">
            <Img src={profile.portrait.src} alt={profile.portrait.alt} sizes="(min-width: 900px) 14vw, 40vw" />
          </Reveal>
        </div>

        {profile.infoArtwork && (
          <Reveal className="info-artwork">
            <Img src={profile.infoArtwork.src} alt={profile.infoArtwork.alt} sizes="(min-width: 900px) 40vw, 100vw" />
          </Reveal>
        )}
      </div>
      <Footer />
    </Page>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard refused: the address stays visible and selectable.
    }
  };
  return (
    <button className="small soft copy-btn" onClick={copy} aria-live="polite">
      <span className="bracket">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
