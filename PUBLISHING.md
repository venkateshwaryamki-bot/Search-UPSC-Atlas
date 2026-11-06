# Publishing Search UPSC Atlas to Google Play and the App Store

The app is ready to build. This guide covers the parts that need you: accounts, signing keys and the store forms. Do the steps in order. Expect about two weeks for Android, mostly waiting time, and a few days for iOS.

| Item | Value |
| --- | --- |
| App name | Search UPSC Atlas |
| App ID (Android package and iOS bundle ID) | `com.searchupsc.atlas` (permanent, never change it) |
| Version | 1.0.0 |
| Android target | API 36, minimum API 24 (Android 7) |
| iOS minimum | iOS 15 |

## What's in this repository

- `www/` is the offline app, built by `node build.mjs`. Fonts are bundled, so it needs no internet.
- `android/` and `ios/` are the native projects (Capacitor 8).
- `codemagic.yaml` holds the cloud builds for both stores. You don't need a Mac.
- `store/` has the screenshots, feature graphic, icon and the listing text (`store/listing.md`).
- `docs/privacy.html` is the privacy policy page.

## Step 0: The code on GitHub (done)

The project lives at https://github.com/venkateshwaryamki-bot/Search-UPSC-Atlas on the `main` branch. Codemagic builds from there.

## Step 1: Create the developer accounts

**Google Play Console**: https://play.google.com/console/signup
- One-time fee of US$25. Choose a **personal** account unless you have a registered company.
- Google verifies your identity (government ID) and a phone number. This can take a few days.
- New personal accounts must run a **closed test with at least 12 testers for 14 days** before the app can go public. Start recruiting testers early, for example from your Telegram channel. Each tester needs a Gmail account.

**Apple Developer Program**: https://developer.apple.com/programs/enroll/
- US$99 per year. Enrol as an **individual** using the Apple Developer app on an iPhone (it scans your ID).
- Your Apple ID needs two-factor authentication turned on.
- Approval usually takes 1–2 days.

## Step 2: Publish the privacy policy

Both stores need a public privacy policy link.

1. Open `docs/privacy.html` and replace `[your contact email]` with the email you want students to see. Do the same in `store/listing.md`.
2. On GitHub, go to the repository's **Settings → Pages**. Set **Source** to "Deploy from a branch", **Branch** to `main`, **Folder** to `/docs`, then save.
3. After a minute the policy is live at `https://venkateshwaryamki-bot.github.io/Search-UPSC-Atlas/privacy.html`.

## Step 3: Set up Codemagic

1. Sign up at https://codemagic.io with your GitHub account. It has a free tier; check the current free build minutes there.
2. Add the `India` repository as an application. Codemagic finds `codemagic.yaml` on its own.

## Step 4: Android

### 4a. Create your upload key

This key proves future updates come from you. Keep the file and both passwords somewhere safe, such as a password manager and a private cloud folder. Never put it in GitHub.

On any computer with Java installed, run:

```sh
keytool -genkey -v -keystore searchupsc-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

If you don't have Java, ask Claude to generate the key file for you and send it over.

In Codemagic, go to **Team settings → Code signing identities → Android keystores** and upload the file. Set the **reference name** to `searchupsc_upload_key` and enter the passwords and alias (`upload`).

### 4b. Build the first app bundle

In Codemagic, start the **Android release (Google Play)** workflow. Google requires the very first upload to be done by hand, so automatic uploading is switched off in `codemagic.yaml` for now. When the build finishes, download the `.aab` file from the build's **Artifacts**.

### 4c. Create the app in Play Console

1. **Create app** with name "Search UPSC Atlas", default language English (India), type App, Free.
2. Under **Test and release → Testing → Closed testing**, create a track, upload the `.aab` and add your 12+ testers by email.
3. Fill in each section of **Grow → Store presence** and **Policy → App content**. The text is in `store/listing.md`.
   - **Store listing:** short and full description, the icon (`store/android/icon-512.png`), the feature graphic, and the phone screenshots (`store/android/phone/`).
   - **Privacy policy:** your GitHub Pages link.
   - **App access:** "All functionality is available without special access".
   - **Ads:** "No, my app does not contain ads".
   - **Content rating:** fill in the questionnaire, answering no to every content question.
   - **Target audience:** choose 13+ age groups. Selecting under-13 brings in the stricter Families policy, which this app doesn't need.
   - **Data safety:** "No" to collecting or sharing data.
   - **Government apps:** No. **Financial features:** none. **Health:** none.
4. Send the test out. Once 12 testers have stayed opted in for 14 days, click **Apply for production** and answer the short questionnaire. Google then reviews the app, which usually takes a few days.

### 4d. Later updates (optional automation)

To let Codemagic upload new versions itself, create a Google Cloud service account with Play Console access. Follow Codemagic's guide at https://docs.codemagic.io/yaml-publishing/google-play/. Save its JSON as the variable `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` in a Codemagic group named `google_play`, then uncomment the `groups:` and `publishing:` lines in the `android-release` part of `codemagic.yaml` (or ask Claude to).

## Step 5: iOS

### 5a. Connect Codemagic to Apple

1. In **App Store Connect → Users and Access → Integrations → App Store Connect API**, create a key with the **App Manager** role. Download the `.p8` file (you can only download it once) and note the Key ID and Issuer ID.
2. In Codemagic, go to **Team settings → Team integrations → Developer Portal → Manage keys** and add the key with the name `searchupsc_asc_key`. Codemagic then creates the certificates and profiles for you.

### 5b. Create the app record

1. In App Store Connect, go to **Apps → + → New App**. Choose platform iOS, name "Search UPSC Atlas", primary language English (India), and bundle ID `com.searchupsc.atlas`. If the bundle ID isn't in the list, register it first at https://developer.apple.com/account/resources/identifiers. For SKU, enter `searchupsc-atlas`.
2. Start the **iOS release (App Store)** workflow in Codemagic. It builds on a cloud Mac and uploads to **TestFlight**.

### 5c. Submit for review

1. **App Information:** category Education, the privacy policy URL, and age rating (answer "None" to everything, which gives 4+).
2. **App Privacy:** "Data Not Collected".
3. **Version 1.0:** iPhone 6.9" screenshots (`store/ios/iphone-6.9/`), iPad 13" screenshots (`store/ios/ipad-13/`), plus the description, keywords, subtitle and promotional text from `store/listing.md`. Also add a support URL; your GitHub Pages address or Telegram channel link works.
4. Pick the TestFlight build and click **Add for Review**. Apple usually answers within 1–2 days.

Apple sometimes rejects apps that look like a wrapped website (guideline 4.2). This app is a good case for approval: it works offline, has interactive quizzes and uses the native share sheet. If Apple pushes back anyway, reply in App Store Connect explaining those features. Ask Claude for help with the reply.

## Updating the app later

1. Edit the facts in `src/` (or ask Claude to), then push to GitHub.
2. Raise the version number: `versionName` in `android/app/build.gradle` and `MARKETING_VERSION` in `ios/App/App.xcodeproj/project.pbxproj` (for example 1.0.1). Build numbers rise automatically on Codemagic.
3. Run both workflows in Codemagic, then roll the new version out in each console.

## Costs

| Item | Cost |
| --- | --- |
| Google Play developer account | US$25 once |
| Apple Developer Program | US$99 per year |
| Codemagic | Free tier, paid if you exceed its build minutes |
| GitHub Pages | Free |

## Not yet tested

These native projects haven't been built on a real Android SDK or Mac yet: Android's download server is blocked in the Claude session, and iOS needs macOS. The first Codemagic build is the first real test. If it fails, share the build log with Claude.
