package com.prosync.android.ui.auth.register

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.prosync.android.R
import com.prosync.android.databinding.FragmentRegisterBinding
import com.prosync.android.ui.auth.AuthState
import com.prosync.android.ui.auth.AuthViewModel
import com.prosync.android.ui.main.MainActivity

class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AuthViewModel by viewModels()
    private var selectedRole = "collaborator"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Selección de rol
        binding.cardManager.setOnClickListener {
            selectedRole = "manager"
            binding.cardManager.strokeColor = resources.getColor(R.color.gold, null)
            binding.cardManager.strokeWidth = 6
            
            binding.cardCollaborator.strokeColor = resources.getColor(R.color.surface_light, null)
            binding.cardCollaborator.strokeWidth = 2
        }

        binding.cardCollaborator.setOnClickListener {
            selectedRole = "collaborator"
            binding.cardCollaborator.strokeColor = resources.getColor(R.color.gold, null)
            binding.cardCollaborator.strokeWidth = 6
            
            binding.cardManager.strokeColor = resources.getColor(R.color.surface_light, null)
            binding.cardManager.strokeWidth = 2
        }

        binding.btnRegister.setOnClickListener {
            viewModel.register(
                email           = binding.etEmail.text.toString(),
                password        = binding.etPassword.text.toString(),
                fullName        = binding.etFullName.text.toString(),
                confirmPassword = binding.etConfirmPassword.text.toString(),
                role            = selectedRole
            )
        }

        binding.tvGoLogin.setOnClickListener {
            findNavController().navigateUp()
        }

        viewModel.authState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is AuthState.Loading -> {
                    binding.btnRegister.isEnabled  = false
                    binding.progressBar.visibility = View.VISIBLE
                }
                is AuthState.Success -> {
                    binding.progressBar.visibility = View.GONE
                    startActivity(Intent(requireContext(), MainActivity::class.java))
                    requireActivity().finish()
                }
                is AuthState.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnRegister.isEnabled  = true
                    Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                    viewModel.resetState()
                }
                else -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnRegister.isEnabled  = true
                }
            }
        }
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
