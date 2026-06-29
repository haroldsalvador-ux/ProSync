package com.prosync.android.utils

import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.widget.Toolbar
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.prosync.android.R
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

fun Fragment.setupNotificationBell(toolbar: Toolbar) {
    // Buscar si ya existe la campana para no duplicarla, en vez de removeAllViews()
    // que borraría el ícono de retroceso (navigationIcon)
    if (toolbar.findViewById<View>(R.id.btnNotifications) != null) return

    val bellView = LayoutInflater.from(requireContext())
        .inflate(R.layout.view_notification_bell, null)

    val params = Toolbar.LayoutParams(
        Toolbar.LayoutParams.WRAP_CONTENT,
        Toolbar.LayoutParams.WRAP_CONTENT,
        Gravity.END or Gravity.CENTER_VERTICAL
    )
    params.marginEnd = 8

    val btnBell = bellView.findViewById<ImageButton>(R.id.btnNotifications)
    val tvBadge = bellView.findViewById<TextView>(R.id.tvBadge)

    btnBell.setOnClickListener {
        findNavController().navigate(R.id.notificationsFragment)
    }

    val uid = FirebaseAuth.getInstance().currentUser?.uid ?: return
    val db  = FirebaseFirestore.getInstance()

    callbackFlow {
        val listener = db.collection("notifications")
            .whereEqualTo("userUid", uid)
            .whereEqualTo("isRead", false)
            .addSnapshotListener { snap, _ ->
                trySend(snap?.size() ?: 0)
            }
        awaitClose { listener.remove() }
    }.onEach { count ->
        if (count > 0) {
            tvBadge.visibility = View.VISIBLE
            tvBadge.text = if (count > 9) "9+" else count.toString()
        } else {
            tvBadge.visibility = View.GONE
        }
    }.launchIn(viewLifecycleOwner.lifecycleScope)

    toolbar.addView(bellView, params)
}
