package com.prosync.android.utils

import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope

val Fragment.viewScope get() = viewLifecycleOwner.lifecycleScope
