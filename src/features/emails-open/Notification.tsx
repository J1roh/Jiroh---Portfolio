import type { EmailOpen, EmailsOpenContent } from "@content/index";

type NotificationProps = { content: EmailsOpenContent; email: EmailOpen };

/** The lock-screen notification the email arrives as: sender badge, subject, preview, and the others waiting. */
export function Notification({ content, email }: NotificationProps) {
  return (
    <div className="notice">
      <p className="notice__label">{content.notificationsLabel}</p>
      <div className="notice__card">
        <span className="notice__badge" aria-hidden="true">{email.initials}</span>
        <div className="notice__text">
          <p className="notice__top"><strong>{email.brand}</strong><span>{content.now}</span></p>
          <p className="notice__subject">{email.subject}</p>
          <p className="notice__preview">{email.preview}</p>
        </div>
      </div>
      <p className="notice__more">{content.more}</p>
    </div>
  );
}
