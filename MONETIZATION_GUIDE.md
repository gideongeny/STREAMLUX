# Monetization Guide for StreamLux

Since you don't have accounts yet, follow these steps to start earning money.

## 1. Sign Up (It's Free)
You need to register as a **Publisher** to get paid.

### Option A: PropellerAds (Recommended for Beginners)
*   **Sign Up Link:** [https://propellerads.com/publishers/](https://propellerads.com/publishers/)
*   **Why:** Easy approval, good rates for streaming sites.
*   **What to do:**
    1.  Register.
    2.  Click "Add Site" -> Enter your Vercel URL.
    3.  Verify your site (they will ask you to upload a file or add a meta tag - ask me if you need help!).
    4.  Create a **"MultiTag"** or **"Popunder"** zone.
    5.  Copy the code they give you.

### Option B: PopAds
*   **Sign Up Link:** [https://www.popads.net/register.html](https://www.popads.net/register.html)
*   **Why:** Very famous for popups, instant payouts.
*   **What to do:**
    1.  Register and login.
    2.  Click "New Website".
    3.  Enter your details and wait for approval (usually 24 hours).
    4.  Get the "Code Generator" code.

---

## 2. Where to Paste the Code

### If you chose PropellerAds / PopAds (Popunder):
1.  Copy the script provided by the website.
2.  Open **`public/index.html`** in this project.
3.  Paste it before the `</head>` tag (I left a comment there for you).

### If you chose Banner Ads:
1.  Create a "Banner" zone on the ad website (size 728x90 or 468x60).
2.  Copy the **Direct Link** or **Script URL**.
3.  Open **`src/components/Common/AdBanner.tsx`**.
4.  Paste the URL into the code where it says `// REPLACE THIS URL`.

## 3. How to Withdraw Money
*   Check your dashboard on the ad website daily.
*   Add your PayPal / Bank wire details in their "Profile" section.
*   When you hit the minimum limit ($5 or $20), request a payout.
