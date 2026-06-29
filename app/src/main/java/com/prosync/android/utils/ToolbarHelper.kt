package com.prosync.android.utils

import androidx.appcompat.widget.Toolbar
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.prosync.android.R

fun Fragment.setupToolbar(toolbar: Toolbar, showBack: Boolean = true) {
    toolbar.setNavigationIcon(R.drawable.ic_arrow_back)
    if (showBack) {
        toolbar.setNavigationOnClickListener {
            findNavController().navigateUp()
        }
    } else {
        toolbar.navigationIcon = null
    }
}
