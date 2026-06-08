# ─── Job Genie — ProGuard / R8 Configuration ───────────────────────────────

# ─── CAPACITOR ───────────────────────────────────────────────────────────────
# Capacitor bridges between native code and the WebView. These classes are
# called via reflection and must not be renamed or removed by R8.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.CapacitorPlugin *;
}

# ─── FIREBASE ────────────────────────────────────────────────────────────────
# Firebase SDK uses reflection internally; preserve all Firebase classes.
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ─── GOOGLE SIGN IN ──────────────────────────────────────────────────────────
-keep class com.google.android.gms.auth.** { *; }

# ─── WEBVIEW (JavaScript Interface) ──────────────────────────────────────────
# Protect any classes annotated with @JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─── ANDROID COMPONENTS ──────────────────────────────────────────────────────
# Keep standard Android entry points (Activities, Services, Receivers, Providers)
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# ─── SUPPRESS BENIGN WARNINGS ────────────────────────────────────────────────
-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**

# ─── DEBUGGING (Disabled for security in release) ────────────────────────────
# Do NOT uncomment these in production — they embed original source file names
# and line numbers into the APK, making reverse engineering easier.
# -keepattributes SourceFile,LineNumberTable
# -renamesourcefileattribute SourceFile
