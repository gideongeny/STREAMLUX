# StreamLux ProGuard Rules
# Keeps essential classes intact when R8 minification is enabled

# ── Capacitor ────────────────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-dontwarn com.getcapacitor.**

# ── Firebase Auth & Firestore ─────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ── AdMob ─────────────────────────────────────────────────────────────────────
-keep class com.google.android.gms.ads.** { *; }

# ── WebView JavaScript Interface ──────────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Capacitor Plugins ─────────────────────────────────────────────────────────
-keep class com.capacitorjs.** { *; }
-keep class io.ionic.** { *; }

# ── Google Sign-In ────────────────────────────────────────────────────────────
-keep class com.codetrixstudio.** { *; }

# ── Prevent stripping serializable data classes ───────────────────────────────
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ── Keep line numbers for crash debugging ─────────────────────────────────────
-keepattributes SourceFile,LineNumberTable

