package com.prosync.android

import android.app.Application
import com.google.firebase.FirebaseApp

class ProSyncApp : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
