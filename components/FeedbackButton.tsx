const MAILTO =
  "mailto:ryzesports1@gmail.com" +
  "?subject=" + encodeURIComponent("Ryze Sports — Feedback") +
  "&body=" + encodeURIComponent("Your feedback (bugs, ideas, anything):\n\n");

export default function FeedbackButton() {
  return (
    <a className="fbk" href={MAILTO} aria-label="Send feedback by email">
      <span aria-hidden="true">💬</span> Feedback
    </a>
  );
}
