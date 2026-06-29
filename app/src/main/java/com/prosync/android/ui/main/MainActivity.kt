package com.prosync.android.ui.main

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import com.prosync.android.R
import com.prosync.android.databinding.ActivityMainBinding
import com.prosync.android.ui.auth.AuthActivity

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // Permiso concedido
        } else {
            // Permiso denegado
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (FirebaseAuth.getInstance().currentUser == null) {
            startActivity(Intent(this, AuthActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        askNotificationPermission()
        com.prosync.android.utils.LocalNotificationHelper.createNotificationChannel(this)

        val navHost = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHost.navController

        binding.bottomNav.setupWithNavController(navController)

        // Manejar la navegación para que DashboardFragment actúe como ManagerHomeFragment si es manager
        navController.addOnDestinationChangedListener { _, destination, _ ->
            if (destination.id == R.id.dashboardFragment) {
                lifecycleScope.launch {
                    val db = FirebaseFirestore.getInstance()
                    val uid = FirebaseAuth.getInstance().currentUser?.uid ?: return@launch
                    try {
                        val snap = db.collection("users").document(uid).get().await()
                        val role = snap.getString("role") ?: "collaborator"
                        if (role == "manager") {
                            navController.navigate(R.id.managerHomeFragment)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }

        // Leer rol y ajustar visibilidad del menú dinámicamente
        lifecycleScope.launch {
            val db = FirebaseFirestore.getInstance()
            val uid = FirebaseAuth.getInstance().currentUser?.uid ?: return@launch
            try {
                val snap = db.collection("users").document(uid).get().await()
                val role = snap.getString("role") ?: "collaborator"

                val menu = binding.bottomNav.menu
                if (role == "manager") {
                    // Manager: Ocultamos Inicio (se redirige a Panel) y mostramos Panel
                    menu.findItem(R.id.dashboardFragment)?.isVisible = false
                    menu.findItem(R.id.managerHomeFragment)?.isVisible = true
                } else {
                    // Colaborador: Mostramos Inicio y ocultamos Panel de Manager
                    menu.findItem(R.id.dashboardFragment)?.isVisible = true
                    menu.findItem(R.id.managerHomeFragment)?.isVisible = false
                }

            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                updateFcmToken()
            }
        } else {
            updateFcmToken()
        }
    }

    private fun updateFcmToken() {
        com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                val uid = FirebaseAuth.getInstance().currentUser?.uid ?: return@addOnCompleteListener
                FirebaseFirestore.getInstance().collection("users").document(uid)
                    .update("fcmToken", token)
            }
        }
    }
}
