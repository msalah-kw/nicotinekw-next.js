"use client";

import React, { useState, useTransition } from "react";
import { revalidateCatalog } from "../actions/revalidateActions";

export default function TempRevalidatePage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleRevalidate = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await revalidateCatalog();
      if (res.success) {
        setStatus({ success: true, message: res.message });
      } else {
        setStatus({ success: false, error: res.error });
      }
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>بوابة إعادة تهيئة الذاكرة المؤقتة ⚡</h1>
        <p style={styles.subtitle}>Cache Revalidation Portal</p>

        <div style={styles.card}>
          <div style={styles.infoSection}>
            <h2 style={styles.sectionTitle}>تحديث تصنيفات ومواصفات المنتجات</h2>
            <p style={styles.description}>
              سيؤدي هذا الإجراء إلى إفراغ الذاكرة المؤقتة (Cache Purge) في Next.js لعلامات التصنيف التالية:
            </p>
            <div style={styles.tagsContainer}>
              <span style={styles.tag}>categories</span>
              <span style={styles.tag}>attributes</span>
            </div>
            <p style={styles.description}>
              سيتم جلب البيانات النظيفة بالكامل (باللغة العربية فقط مثل: <strong>نكهة، سحبات جاهزة، بودات</strong>) مباشرة من WordPress WPGraphQL عند الزيارة القادمة للموقع.
            </p>
          </div>

          <div style={styles.actionSection}>
            <button
              onClick={handleRevalidate}
              disabled={isPending}
              style={{
                ...styles.button,
                ...(isPending ? styles.buttonDisabled : {}),
              }}
            >
              {isPending ? (
                <span style={styles.loaderContainer}>
                  <span style={styles.spinner}></span>
                  جاري التحديث...
                </span>
              ) : (
                "تحديث الذاكرة المؤقتة الآن"
              )}
            </button>
          </div>

          {status && (
            <div
              style={{
                ...styles.statusMessage,
                ...(status.success ? styles.successAlert : styles.errorAlert),
              }}
            >
              {status.success ? (
                <div style={styles.statusContent}>
                  <span style={styles.statusIcon}>✓</span>
                  <div>
                    <strong style={styles.statusTitle}>نجاح العملية!</strong>
                    <p style={styles.statusDesc}>{status.message}</p>
                  </div>
                </div>
              ) : (
                <div style={styles.statusContent}>
                  <span style={styles.statusIcon}>✗</span>
                  <div>
                    <strong style={styles.statusTitle}>خطأ في التحديث!</strong>
                    <p style={styles.statusDesc}>{status.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.warningCard}>
          <strong style={styles.warningTitle}>⚠️ تنبيه هام للمطور:</strong>
          <p style={styles.warningDesc}>
            هذه الصفحة مؤقتة لأغراض الصيانة وإعادة بناء الكاش بعد تنظيف قاعدة البيانات. يرجى التأكد من 
            <strong> حذف مجلد <code>src/app/temp-revalidate</code></strong> بالكامل من الكود البرمجي ورفعه للإنتاج بمجرد التأكد من تحديث البيانات لمنع أي ثغرات أمنية أو إعادة تهيئة غير مصرح بها.
          </p>
        </div>
      </div>
    </div>
  );
}

// Sleek modern styling using CSS-in-JS referencing custom variables and premium UI design rules
const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#0d0f12",
    backgroundImage: "radial-gradient(circle at top right, rgba(255, 140, 0, 0.08) 0%, transparent 60%)",
    fontFamily: "var(--font-family), system-ui, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    direction: "rtl",
    color: "#e2e8f0",
  },
  container: {
    maxWidth: "600px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "center",
    background: "linear-gradient(135deg, #FF9800 0%, #FFA500 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.25rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#64748b",
    textAlign: "center",
    marginTop: "-0.5rem",
    letterSpacing: "0.05em",
    fontWeight: "500",
  },
  card: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#ffffff",
  },
  description: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#94a3b8",
  },
  tagsContainer: {
    display: "flex",
    gap: "0.5rem",
    margin: "0.5rem 0",
  },
  tag: {
    background: "rgba(255, 140, 0, 0.12)",
    border: "1px solid rgba(255, 140, 0, 0.3)",
    color: "#FF8C00",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    letterSpacing: "0.02em",
  },
  actionSection: {
    marginTop: "0.5rem",
  },
  button: {
    width: "100%",
    padding: "14px 28px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #FF9800 0%, #E65100 100%)",
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(230, 81, 0, 0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    background: "#334155",
    color: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  statusMessage: {
    borderRadius: "12px",
    padding: "1rem",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  successAlert: {
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34d399",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#f87171",
  },
  statusContent: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start",
  },
  statusIcon: {
    fontSize: "1.25rem",
    lineHeight: "1",
    marginTop: "2px",
  },
  statusTitle: {
    display: "block",
    fontWeight: "600",
    marginBottom: "2px",
  },
  statusDesc: {
    margin: 0,
    opacity: 0.9,
  },
  warningCard: {
    background: "rgba(220, 38, 38, 0.05)",
    border: "1px solid rgba(220, 38, 38, 0.2)",
    borderRadius: "12px",
    padding: "1.25rem",
    fontSize: "0.85rem",
    lineHeight: "1.6",
    color: "#f87171",
  },
  warningTitle: {
    display: "block",
    fontWeight: "600",
    marginBottom: "4px",
  },
  warningDesc: {
    margin: 0,
    opacity: 0.9,
  },
};
