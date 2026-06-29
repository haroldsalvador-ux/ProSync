buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.4.1")
        classpath("androidx.navigation:navigation-safe-args-gradle-plugin:2.7.6")
    }
}

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}