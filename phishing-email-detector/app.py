"""
Interactive Phishing Email Checker
Run: python app.py
"""

import os
import sys
from phishing_detector import PhishingDetector, train_and_evaluate, predict_email

MODEL_DIR = "model"

def load_or_train():
    tfidf_path = os.path.join(MODEL_DIR, "tfidf.pkl")
    clf_path   = os.path.join(MODEL_DIR, "classifier.pkl")
    if os.path.exists(tfidf_path) and os.path.exists(clf_path):
        print("[i] Loading existing model...")
        return PhishingDetector.load(MODEL_DIR)
    else:
        print("[i] No saved model found. Training now...")
        return train_and_evaluate()

def banner():
    print("""
╔══════════════════════════════════════════════════╗
║        PHISHING EMAIL DETECTION SYSTEM          ║
║          Powered by Scikit-learn ML             ║
╚══════════════════════════════════════════════════╝
    """)

def main():
    banner()
    detector = load_or_train()

    print("\nType an email body to check, or use these commands:")
    print("  'demo'  — run demo on sample emails")
    print("  'train' — retrain the model")
    print("  'quit'  — exit\n")

    while True:
        try:
            user_input = input("Enter email text > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n[i] Exiting. Stay safe from phishing!")
            break

        if not user_input:
            continue
        if user_input.lower() == "quit":
            print("[i] Goodbye!")
            break
        if user_input.lower() == "train":
            detector = train_and_evaluate()
            continue
        if user_input.lower() == "demo":
            demos = [
                "URGENT: Your account suspended. Click http://secure-verify.cc/auth now!",
                "Hi John, meeting notes from today's standup are attached. See you tomorrow!",
                "Claim your $500 gift card at http://giftcard-free.xyz/claim — limited time!",
                "Your electricity bill for November is $87.50. Due by December 10th.",
            ]
            print("\n── Demo Results ─────────────────────────────────")
            for email in demos:
                result = predict_email(detector, email)
                print(f"\n  Email : {email[:65]}...")
                print(f"  → {result['label']}  ({result['confidence']} confidence)")
            print("─────────────────────────────────────────────────\n")
            continue

        result = predict_email(detector, user_input)
        print(f"\n  ┌─────────────────────────────────────────┐")
        print(f"  │  Result     : {result['label']:<26}│")
        print(f"  │  Confidence : {result['confidence']:<26}│")
        print(f"  │  Phishing   : {result['phishing_prob']:<26}│")
        print(f"  │  Safe       : {result['safe_prob']:<26}│")
        print(f"  └─────────────────────────────────────────┘\n")


if __name__ == "__main__":
    main()
