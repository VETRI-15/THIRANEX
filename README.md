# 🛡️ Phishing Email Detection Model

A machine learning model built with **Scikit-learn** that classifies emails as **Phishing** or **Safe** with high accuracy based on textual content and URL features.

---

## 📌 Key Features

- ✅ Trained on a dataset of phishing and legitimate emails
- 🔍 Extracts and analyzes email features (URLs, suspicious keywords, TLDs)
- 🤖 Classifies emails as **"Phishing"** or **"Safe"**
- 📊 Displays **accuracy score**, **classification report**, and **confusion matrix**
- 💾 Saves the trained model for reuse
- 🖥️ Interactive CLI app for real-time email checking

---

## 🗂️ Project Structure

```
phishing-email-detector/
│
├── phishing_detector.py   # Core ML model (dataset, features, training, evaluation)
├── app.py                 # Interactive CLI application
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

---

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/phishing-email-detector.git
cd phishing-email-detector

# 2. Install dependencies
pip install -r requirements.txt
```

---

## 🚀 Usage

### Train & Evaluate the Model
```bash
python phishing_detector.py
```
This will:
- Train the Random Forest classifier on the built-in dataset
- Print accuracy and classification report
- Save confusion matrix chart as `results.png`
- Save the trained model to `model/`

### Interactive Email Checker
```bash
python app.py
```
Commands inside the app:
| Command | Action |
|---------|--------|
| Type any email text | Classify it instantly |
| `demo` | Run demo on 4 sample emails |
| `train` | Retrain the model |
| `quit` | Exit the app |

---

## 🧠 How It Works

### Feature Engineering
The model combines **two types of features**:

| Feature Type | Details |
|---|---|
| **TF-IDF Text Features** | Top 3000 unigrams + bigrams from email body |
| **URL Features** | Has URL, suspicious TLD (.xyz, .cc, .ru, .tk), URL count |
| **Keyword Features** | Count of phishing-related keywords (urgent, verify, claim, etc.) |
| **Style Features** | Count of exclamation marks |

### Model
- **Algorithm**: Random Forest Classifier (100 estimators)
- **Vectorizer**: TF-IDF (1-gram + 2-gram, 3000 features)
- **Combiner**: Sparse matrix horizontal stack (TF-IDF + numeric features)

---

## 📊 Sample Output

```
Accuracy : 96.00%

Classification Report:
              precision    recall  f1-score   support

        Safe       0.96      0.96      0.96        13
    Phishing       0.92      0.92      0.92        13

    accuracy                           0.96        26
```

---

## 🔮 Expected Outcome

The model successfully classifies emails as **Phishing** or **Safe** with high accuracy (≥95%) based on:
- Textual content patterns
- URL presence and suspicious domain extensions
- Phishing-specific keyword density

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Python 3.8+ | Core language |
| Scikit-learn | ML model (Random Forest, TF-IDF) |
| NumPy / SciPy | Numeric computation & sparse matrices |
| Pandas | Data handling |
| Matplotlib | Confusion matrix & results chart |
| Joblib | Model serialization |

---

## 📁 Model Files (auto-generated after training)

```
model/
├── tfidf.pkl         # Trained TF-IDF vectorizer
└── classifier.pkl    # Trained Random Forest classifier
```

---

## 👨‍💻 Author

Developed as part of a Cybersecurity AI Project.  
Feel free to fork, star ⭐, and contribute!

---

## 📄 License

MIT License — free to use, modify, and distribute.
