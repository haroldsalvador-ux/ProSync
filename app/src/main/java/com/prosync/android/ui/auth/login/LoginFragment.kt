package com.prosync.android.ui.auth.login

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.prosync.android.R
import com.prosync.android.databinding.FragmentLoginBinding
import com.prosync.android.ui.auth.AuthState
import com.prosync.android.ui.auth.AuthViewModel
import com.prosync.android.ui.main.MainActivity

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AuthViewModel by viewModels()

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account.idToken ?: return@registerForActivityResult
                viewModel.loginWithGoogle(idToken) { ok, msg ->
                    if (!ok) Toast.makeText(requireContext(), msg, Toast.LENGTH_LONG).show()
                }
            } catch (e: ApiException) {
                Toast.makeText(requireContext(), "Error Google: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnLogin.setOnClickListener {
            viewModel.login(
                binding.etEmail.text.toString(),
                binding.etPassword.text.toString()
            )
        }

        binding.btnGoogleLogin.setOnClickListener {
            val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
                .build()
            val client = GoogleSignIn.getClient(requireActivity(), gso)
            googleSignInLauncher.launch(client.signInIntent)
        }

        binding.tvGoRegister.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_register)
        }

        viewModel.authState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is AuthState.Loading -> {
                    binding.btnLogin.isEnabled       = false
                    binding.btnGoogleLogin.isEnabled = false
                    binding.progressBar.visibility   = View.VISIBLE
                }
                is AuthState.Success -> {
                    binding.progressBar.visibility = View.GONE
                    startActivity(Intent(requireContext(), MainActivity::class.java))
                    requireActivity().finish()
                }
                is AuthState.Error -> {
                    binding.progressBar.visibility   = View.GONE
                    binding.btnLogin.isEnabled       = true
                    binding.btnGoogleLogin.isEnabled = true
                    Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }
                else -> {
                    binding.progressBar.visibility   = View.GONE
                    binding.btnLogin.isEnabled       = true
                    binding.btnGoogleLogin.isEnabled = true
                }
            }
        }
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
