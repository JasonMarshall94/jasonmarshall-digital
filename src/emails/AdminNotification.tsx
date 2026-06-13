import * as React from "react";

interface Props {
  name: string;
  email: string;
  type: string;
  budget: string;
  message: string;
}

export default function AdminNotification({
  name,
  email,
  type,
  budget,
  message,
}: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New project brief from {name}</title>
      </head>
      <body style={body}>
        <div style={container}>
          <h1 style={heading}>New project brief from {name}</h1>
          <hr style={hr} />
          <table style={table} cellPadding={0} cellSpacing={0}>
            <tbody>
              <Field label="Name" value={name} />
              <Field label="Email" value={email} />
              <Field label="Project Type" value={type} />
              <Field label="Budget" value={budget} />
            </tbody>
          </table>
          <hr style={hr} />
          <p style={fieldLabel}>Message</p>
          <p style={message_}>{message}</p>
          <hr style={hr} />
          <p style={footer}>Reply to this email to respond to {name}.</p>
        </div>
      </body>
    </html>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={fieldLabel}>{label}</td>
      <td style={fieldValue}>{value}</td>
    </tr>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  fontFamily: "Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: "560px",
  margin: "32px auto",
  padding: "32px",
  border: "1px solid #e5e5e5",
};

const heading: React.CSSProperties = {
  fontSize: "18px",
  color: "#111111",
  margin: "0 0 20px",
  fontWeight: 600,
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e5e5",
  margin: "20px 0",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#666666",
  paddingBottom: "12px",
  paddingRight: "20px",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

const fieldValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#111111",
  paddingBottom: "12px",
};

const message_: React.CSSProperties = {
  fontSize: "14px",
  color: "#111111",
  whiteSpace: "pre-wrap",
  margin: "8px 0 0",
  lineHeight: "1.6",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  margin: "0",
};
