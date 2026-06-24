"""
Phishing Email Detection Model
================================
Uses Scikit-learn to classify emails as "Phishing" or "Safe"
Features: TF-IDF text features + URL/keyword analysis
"""

import re
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, ConfusionMatrixDisplay
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
import scipy.sparse as sp
import joblib
import os

# ─────────────────────────────────────────────
# 1.  DATASET  (synthetic but realistic)
# ─────────────────────────────────────────────
def load_dataset():
    """Return a labelled DataFrame of phishing (1) and safe (0) emails."""

    phishing_emails = [
        "URGENT: Your account has been compromised! Click http://malicious-login.xyz/verify to secure it now.",
        "Congratulations! You've won $1,000,000. Click here http://free-prize.ru/claim to claim your reward.",
        "Dear user, verify your PayPal account immediately at http://paypal-secure-login.net/confirm",
        "Your bank account will be suspended. Login at http://bank-update.xyz/login to prevent this.",
        "ALERT: Suspicious login detected. Confirm your identity at http://secure-verify.cc/auth",
        "You have a pending package. Click http://delivery-track.xyz/confirm to schedule delivery.",
        "IRS TAX REFUND PENDING. Submit your details at http://irs-refund.net/claim immediately.",
        "Your Apple ID is locked. Restore access at http://apple-id-verify.xyz/unlock now.",
        "Netflix subscription expired. Update payment at http://netflix-billing.cc/update to continue.",
        "Win a free iPhone! Limited time offer. Claim now at http://free-iphone-giveaway.xyz",
        "Your email will be deactivated. Click http://email-verify.net/confirm within 24 hours.",
        "Amazon account suspended due to unusual activity. Verify at http://amazon-security.cc",
        "FINAL WARNING: Your account password expires today. Update at http://password-reset.xyz",
        "Confirm your Microsoft account or it will be deleted: http://microsoft-verify.net/confirm",
        "Dear customer, your credit card was charged $499. Dispute at http://dispute-charge.xyz",
        "Lottery winner selected! Claim your $500,000 prize at http://lottery-claim.net/winner",
        "Your Social Security Number has been compromised. Act now at http://ssa-secure.xyz",
        "DHL delivery failed. Reschedule at http://dhl-redeliver.cc/track urgently.",
        "Your Google account will be terminated. Verify at http://google-accounts.net/verify",
        "HSBC bank alert: unauthorized transaction detected. Confirm at http://hsbc-secure.xyz",
        "Exclusive offer for you! Click http://special-deals.cc/exclusive to get 90% discount.",
        "Your Dropbox account is full. Upgrade now at http://dropbox-upgrade.xyz/free",
        "Your password was changed. If not you, reset at http://account-recovery.net/reset",
        "Verify your identity or your account will be closed: http://identity-verify.cc/check",
        "You owe unpaid taxes. Avoid arrest by paying at http://tax-payment.xyz/urgent",
        "Dear valued customer, update your billing info at http://billing-update.net/secure",
        "Security breach detected on your account. Login at http://secure-login.xyz/verify",
        "URGENT: Your PayPal is limited. Restore it at http://paypal-restore.net/limited",
        "Claim your free gift card worth $200. Visit http://giftcard-free.xyz/claim today.",
        "Your account has been hacked. Change password at http://account-protect.cc/change",
        "Click verify button to unlock your account http://unlock-account.xyz/verify now",
        "You're selected for a survey reward of $500. Go to http://survey-reward.net/prize",
        "Alert from your bank: update account details at http://bank-details.xyz/update",
        "Suspicious activity on your WhatsApp. Verify at http://whatsapp-secure.net/verify",
        "Your Uber account is suspended. Reinstate at http://uber-account.xyz/restore",
        "Password expiry notice: Update credentials at http://credentials-update.cc/now",
        "Your funds transfer is pending approval at http://funds-transfer.xyz/approve",
        "Congratulations on qualifying for a $10,000 loan. Apply at http://easy-loan.net",
        "Unusual login from Russia detected on your account. Secure it at http://login-block.xyz",
        "Your computer has a virus! Download fix at http://virus-remove.cc/download now.",
        "Limited offer: free Netflix 1 year subscription at http://netflix-free.xyz/activate",
        "FINAL NOTICE: Debt collection. Pay at http://debt-collector.net/pay immediately.",
        "Your crypto wallet needs verification. Go to http://crypto-verify.xyz/wallet",
        "Action required: confirm your email at http://email-confirm.net/verify or lose access",
        "We tried to deliver a package. Reschedule at http://package-reschedule.xyz/new",
        "Dear winner, you have been selected for a prize. Claim at http://prize-claim.cc",
        "Your account login was attempted from unknown device. Check http://device-check.xyz",
        "Update your billing to avoid service interruption: http://billing-secure.net/update",
        "Blocked transaction on your account. Unblock at http://unblock-account.xyz/now",
        "You have 1 unread security message. Click http://security-message.cc/read to view",
    ]

    safe_emails = [
        "Hi team, please find the meeting notes from yesterday's standup attached. Let me know if you have questions.",
        "Dear John, thank you for your purchase. Your order #12345 has been shipped and will arrive in 3-5 days.",
        "Hi there, just a reminder that the project deadline is next Friday. Please submit your reports by Thursday.",
        "Good morning! Here are the key highlights from this week's company newsletter.",
        "Your monthly bank statement for October 2024 is now available. Log in to your official app to view.",
        "Hi, I wanted to follow up on our conversation from last week regarding the Q4 budget proposal.",
        "Dear subscriber, your weekly digest from TechCrunch is ready. Top stories included inside.",
        "Hello, this is a reminder that your dentist appointment is scheduled for tomorrow at 10 AM.",
        "Hi Sarah, could you please review the attached document and share your feedback by EOD?",
        "Your flight booking confirmation: Flight AA123 on Dec 15. Check-in opens 24 hours before departure.",
        "Thank you for registering at our platform. Your username is john_doe. Welcome aboard!",
        "Hi team, the office will be closed on December 25th for the Christmas holiday.",
        "Dear customer, your subscription renewal is due on January 1st. No action needed, auto-renewal is on.",
        "Reminder: quarterly performance review sessions start next week. Please check your calendar invite.",
        "Hi, just wanted to say great job on the presentation yesterday. The client was very impressed!",
        "Your electricity bill for November: $87.50. Due date: December 10. Pay at your usual portal.",
        "The book you requested from the library is now available for pickup. Pick up by Dec 20.",
        "Hi, the team lunch is scheduled for Friday at 12:30 PM at the usual restaurant.",
        "Your annual health insurance renewal is coming up. Review your plan at the official HR portal.",
        "Dear John, we wanted to share the latest product updates released in version 3.2.1 this month.",
        "Meeting rescheduled: the board meeting has moved from Tuesday to Wednesday at 2 PM.",
        "Hi, your GitHub pull request has been reviewed. Two comments were left by your reviewer.",
        "Your internet service will undergo scheduled maintenance on Sunday between 2-4 AM.",
        "Hi, please complete the employee satisfaction survey by end of this week. Link in HR portal.",
        "Your tax documents for 2023 are now available in your official account dashboard.",
        "Dear valued customer, we have updated our privacy policy. Read the full update on our website.",
        "Hi, the weekend coding bootcamp registration is now open. Visit our official site to enroll.",
        "Team, the monthly all-hands call is this Thursday at 4 PM. Dial-in details in calendar invite.",
        "Your gym membership will renew automatically on the 1st. Visit the app if you need to pause.",
        "Hi, I'm reaching out regarding the software architecture decision we discussed in Monday's meeting.",
        "Your Amazon order has been delivered. Leave a review to help other customers.",
        "Dear parent, the school annual day is on December 20th at 5 PM. All parents are invited.",
        "Hi, your parking permit has been renewed for the next 12 months. Sticker will be mailed.",
        "Good news! The bug you reported in ticket #4521 has been resolved in today's deployment.",
        "Hi, your internship application has been received. We'll get back to you within 2 weeks.",
        "Reminder: Team retrospective is scheduled for tomorrow at 3 PM in Conference Room B.",
        "Your weekly fitness report: 4 workouts completed, 12,500 average steps per day. Great work!",
        "Hi John, the design mockups for the new dashboard have been uploaded to the shared drive.",
        "Your 2024 conference registration is confirmed. Badge will be emailed 3 days before the event.",
        "Hi, I wanted to check in on the status of the client deliverables. Are we on track for Friday?",
        "Your Spotify playlist was updated with 5 new tracks based on your listening history.",
        "Dear customer, your support ticket #7892 has been resolved. Please rate your experience.",
        "Hi team, please remember to log your hours in the time tracking system before Friday.",
        "Your credit card statement is ready. Balance due: $342.18 by December 15th via official app.",
        "Hi, just a heads up that the office printer on floor 3 is under maintenance until tomorrow.",
        "Your online course certificate for Python Basics is ready to download from your dashboard.",
        "Dear resident, building maintenance will inspect fire alarms on December 12th from 9 AM-12 PM.",
        "Hi, we have a team outing planned for next Saturday. RSVP by Wednesday to confirm your spot.",
        "Your cloud storage is at 75% capacity. Consider upgrading your plan via the official dashboard.",
        "Hi, the new employee handbook has been updated. Please review it on the company intranet portal.",
    ]

    data = (
        [(email, 1) for email in phishing_emails] +
        [(email, 0) for email in safe_emails]
    )
    df = pd.DataFrame(data, columns=["email_text", "label"])
    return df.sample(frac=1, random_state=42).reset_index(drop=True)


# ─────────────────────────────────────────────
# 2.  FEATURE ENGINEERING
# ─────────────────────────────────────────────
PHISHING_KEYWORDS = [
    "urgent", "verify", "click here", "suspended", "account",
    "login", "password", "update", "confirm", "limited", "offer",
    "free", "prize", "winner", "claim", "secure", "alert",
    "immediate", "warning", "expire", "unauthorized",
]

def extract_url_features(texts):
    """Return a 2-D numpy array of URL-based numeric features."""
    features = []
    for text in texts:
        urls = re.findall(r'http[s]?://\S+', text)
        has_url = int(bool(urls))
        suspicious_tld = int(any(
            re.search(r'\.(xyz|cc|net|ru|tk|ml|ga|cf|gq)\b', u) for u in urls
        ))
        url_count = len(urls)
        keyword_hits = sum(
            1 for kw in PHISHING_KEYWORDS if kw in text.lower()
        )
        exclamation = text.count('!')
        features.append([has_url, suspicious_tld, url_count,
                          keyword_hits, exclamation])
    return np.array(features, dtype=float)


def combined_features(texts):
    """Combine TF-IDF sparse matrix with dense numeric features."""
    # This is used manually, not in a Pipeline, to keep things simple
    pass  # see PhishingDetector class


# ─────────────────────────────────────────────
# 3.  MODEL CLASS
# ─────────────────────────────────────────────
class PhishingDetector:
    def __init__(self):
        self.tfidf = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            stop_words='english',
        )
        self.clf = RandomForestClassifier(
            n_estimators=100, random_state=42, n_jobs=-1
        )
        self._fitted = False

    def _build_X(self, texts, fit_tfidf=False):
        if fit_tfidf:
            tfidf_mat = self.tfidf.fit_transform(texts)
        else:
            tfidf_mat = self.tfidf.transform(texts)
        url_mat = sp.csr_matrix(extract_url_features(texts))
        return sp.hstack([tfidf_mat, url_mat])

    def fit(self, texts, labels):
        X = self._build_X(texts, fit_tfidf=True)
        self.clf.fit(X, labels)
        self._fitted = True
        return self

    def predict(self, texts):
        X = self._build_X(texts)
        return self.clf.predict(X)

    def predict_proba(self, texts):
        X = self._build_X(texts)
        return self.clf.predict_proba(X)

    def save(self, path="model"):
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.tfidf, os.path.join(path, "tfidf.pkl"))
        joblib.dump(self.clf,   os.path.join(path, "classifier.pkl"))
        print(f"[✓] Model saved to '{path}/'")

    @classmethod
    def load(cls, path="model"):
        obj = cls()
        obj.tfidf = joblib.load(os.path.join(path, "tfidf.pkl"))
        obj.clf   = joblib.load(os.path.join(path, "classifier.pkl"))
        obj._fitted = True
        return obj


# ─────────────────────────────────────────────
# 4.  TRAINING + EVALUATION
# ─────────────────────────────────────────────
def train_and_evaluate():
    print("=" * 55)
    print("   Phishing Email Detection Model — Training")
    print("=" * 55)

    df = load_dataset()
    print(f"\n[i] Dataset: {len(df)} emails  "
          f"({df['label'].sum()} phishing, {(df['label']==0).sum()} safe)\n")

    X_train, X_test, y_train, y_test = train_test_split(
        df["email_text"], df["label"],
        test_size=0.25, random_state=42, stratify=df["label"]
    )

    detector = PhishingDetector()
    detector.fit(X_train.tolist(), y_train.tolist())

    y_pred = detector.predict(X_test.tolist())
    acc = accuracy_score(y_test, y_pred)

    print(f"Accuracy : {acc*100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred,
                                 target_names=["Safe", "Phishing"]))

    # ── Confusion matrix plot ──────────────────
    cm = confusion_matrix(y_test, y_pred)
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Confusion matrix
    disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                                   display_labels=["Safe", "Phishing"])
    disp.plot(ax=axes[0], colorbar=False, cmap="Blues")
    axes[0].set_title("Confusion Matrix", fontsize=13, fontweight='bold')

    # Accuracy bar chart
    labels_bar = ['Accuracy', 'Error Rate']
    values_bar = [acc * 100, (1 - acc) * 100]
    colors_bar = ['#2ecc71', '#e74c3c']
    axes[1].bar(labels_bar, values_bar, color=colors_bar, width=0.4)
    for i, v in enumerate(values_bar):
        axes[1].text(i, v + 0.5, f"{v:.1f}%", ha='center',
                     fontsize=11, fontweight='bold')
    axes[1].set_ylim(0, 115)
    axes[1].set_title("Model Performance", fontsize=13, fontweight='bold')
    axes[1].set_ylabel("Percentage (%)")

    plt.suptitle("Phishing Email Detection — Results",
                 fontsize=15, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig("results.png", dpi=150, bbox_inches='tight')
    plt.close()
    print("[✓] Confusion matrix saved as results.png")

    detector.save("model")
    return detector


# ─────────────────────────────────────────────
# 5.  INTERACTIVE PREDICTOR
# ─────────────────────────────────────────────
def predict_email(detector, email_text: str) -> dict:
    proba = detector.predict_proba([email_text])[0]
    pred  = detector.predict([email_text])[0]
    label = "🚨 PHISHING" if pred == 1 else "✅ SAFE"
    return {
        "label"      : label,
        "prediction" : int(pred),
        "confidence" : f"{max(proba)*100:.1f}%",
        "phishing_prob": f"{proba[1]*100:.1f}%",
        "safe_prob"  : f"{proba[0]*100:.1f}%",
    }


# ─────────────────────────────────────────────
# 6.  MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    detector = train_and_evaluate()

    print("\n" + "=" * 55)
    print("   Live Email Classification Demo")
    print("=" * 55)

    test_cases = [
        ("URGENT: Click http://malicious-login.xyz/verify to unlock your account now!",
         "should be → PHISHING"),
        ("Hi team, the project deadline is next Friday. Please submit reports by Thursday.",
         "should be → SAFE"),
        ("Congratulations! You won $1,000,000. Claim at http://prize-claim.cc today!",
         "should be → PHISHING"),
        ("Your monthly bank statement for November is now ready in the official app.",
         "should be → SAFE"),
        ("ALERT: Your Apple ID locked. Restore at http://apple-id-verify.xyz/unlock",
         "should be → PHISHING"),
    ]

    for email, expected in test_cases:
        result = predict_email(detector, email)
        print(f"\nEmail  : {email[:70]}{'...' if len(email)>70 else ''}")
        print(f"Result : {result['label']}  (confidence: {result['confidence']})")
        print(f"         Phishing prob: {result['phishing_prob']}  |  "
              f"Safe prob: {result['safe_prob']}")
        print(f"         [{expected}]")

    print("\n[✓] Training complete. Model saved in 'model/' directory.")
    print("[✓] Results chart saved as 'results.png'")
