/**
 * Aura Hotel Admin - UI Main Logic
 * Handles sidebar toggles and general UI effects
 */

$(document).ready(function() {
    "use strict";

    // Sidebar Toggle for Mobile — with overlay backdrop
    // Inject overlay element once
    if (!$('#sidebar-overlay').length) {
        $('body').append('<div class="sidebar-overlay" id="sidebar-overlay"></div>');
    }

    function openSidebar() {
        $('#sidebar').addClass('show');
        $('#sidebar-overlay').addClass('show');
        $('body').css('overflow', 'hidden');
    }

    function closeSidebar() {
        $('#sidebar').removeClass('show');
        $('#sidebar-overlay').removeClass('show');
        $('body').css('overflow', '');
    }

    $('#sidebar-toggle').on('click', function(e) {
        e.stopPropagation();
        if ($('#sidebar').hasClass('show')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Close sidebar when clicking the overlay
    $(document).on('click', '#sidebar-overlay', function() {
        closeSidebar();
    });

    // Close sidebar on window resize to desktop
    $(window).on('resize', function() {
        if ($(window).width() > 992) {
            closeSidebar();
        }
    });

    // Global Search Highlight Effects
    $('#global-search').on('focus', function() {
        $(this).parent()
            .css('background', '#fff')
            .css('border-color', 'var(--primary)')
            .css('box-shadow', '0 0 0 3px rgba(0, 150, 137, 0.12)');
    }).on('blur', function() {
        $(this).parent()
            .css('background', '#fff')
            .css('border-color', 'var(--border-color)')
            .css('box-shadow', 'none');
    });

    // Add active state to nav links based on clicked
    $('.nav-link').on('click', function() {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    // Toggle Add Category Form
    $('#toggle-add-category, #cancel-form').on('click', function() {
        const form = $('#add-category-form');
        const btn = $('#toggle-add-category');
        const isHidden = form.hasClass('d-none');

        if (isHidden) {
            form.removeClass('d-none');
            btn.html('<i data-lucide="plus" style="width: 20px; height: 20px;"></i> Cancel');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            form.addClass('d-none');
            btn.html('<i data-lucide="plus" style="width: 20px; height: 20px;"></i> Add Category');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
    });

    // Toggle Add Room Form
    $('#toggle-add-room, #cancel-room-form').on('click', function() {
        const form = $('#add-room-form');
        const btn = $('#toggle-add-room');
        const isHidden = form.hasClass('d-none');

        if (isHidden) {
            form.removeClass('d-none');
            btn.html('<i data-lucide="plus" style="width: 20px; height: 20px;"></i> Cancel');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            form.addClass('d-none');
            btn.html('<i data-lucide="plus" style="width: 20px; height: 20px;"></i> Add Room');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
    });

    // Toggle Add User Form
    $('#toggle-add-user, #cancel-user-form').on('click', function() {
        const form = $('#add-user-form');
        const btn = $('#toggle-add-user');
        const isHidden = form.hasClass('d-none');

        if (isHidden) {
            form.removeClass('d-none');
            btn.html('<i data-lucide="x" style="width: 20px; height: 20px;"></i> Cancel');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            form.addClass('d-none');
            btn.html('<i data-lucide="plus" style="width: 20px; height: 20px;"></i> Add User');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
    });

    // New Booking button navigates to Categories
    $('#new-booking-trigger').on('click', function() {
        window.location.href = 'categories.html';
    });

    // Open WhatsApp modal from booking "eye" action
    $(document).on('click', '.open-whatsapp', function() {
        $('#whatsapp-overlay').css('display', 'flex');
    });

    $('#close-whatsapp, #skip-whatsapp, #send-whatsapp, #whatsapp-overlay').on('click', function(e) {
        if (e.target === this || $(e.target).is('i, button')) {
            $('#whatsapp-overlay').hide();
        }
    });

    // Forms are now managed by data-handler.js
});
