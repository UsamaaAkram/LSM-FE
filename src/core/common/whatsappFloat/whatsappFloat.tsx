import { WHATSAPP_ENROLL } from "../bluverseLinks";

// Fixed WhatsApp button shown bottom-right across the public site.
const WhatsappFloat = () => {
  return (
    <a
      href={WHATSAPP_ENROLL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1050,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        color: "#fff",
        fontSize: 30,
        textDecoration: "none",
      }}
    >
      <i className="fa-brands fa-whatsapp" />
    </a>
  );
};

export default WhatsappFloat;
