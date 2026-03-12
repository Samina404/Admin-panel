/**
 * Aura Hotel Admin - Dynamic Data Handling
 * Fully functional prototype via localStorage
 */

let appData = null;

$(document).ready(async function() {
    await initData();

    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path.endsWith('AdminPanel-AyraHotel/')) {
        renderDashboard();
    } else if (path.includes('categories.html')) {
        renderCategoriesPage();
    } else if (path.includes('rooms.html')) {
        renderRoomsPage();
    } else if (path.includes('bookings.html')) {
        renderBookingsPage();
    } else if (path.includes('users.html')) {
        renderUsersPage();
    } else if (path.includes('gallery.html')) {
        renderGalleryPage();
    }

    bindEvents();
});

async function initData() {
    const localData = localStorage.getItem('aura_hotel_data');
    if (localData) {
        appData = JSON.parse(localData);
        updateStats(); // ensure stats are accurate based on current lists
    } else {
        try {
            const response = await fetch('data/dashboard.json');
            appData = await response.json();
            updateStats();
        } catch (error) {
            console.error("Error loading initial data:", error);
        }
    }
}

function saveData() {
    localStorage.setItem('aura_hotel_data', JSON.stringify(appData));
    updateStats();
}

function updateStats() {
    if(!appData) return;
    appData.stats.totalRooms = appData.rooms.length;
    appData.stats.totalBookings = appData.recentBookings.length;
    appData.stats.availableRooms = appData.rooms.filter(r => r.status === 'Available').length;
    appData.stats.pendingBookings = appData.recentBookings.filter(b => b.status === 'Pending').length;
    localStorage.setItem('aura_hotel_data', JSON.stringify(appData));
}

// ========================
// PAGE RENDERERS
// ========================

function renderDashboard() {
    renderStats(appData.stats);
    renderBookings(appData.recentBookings.slice(0, 5));
    renderQuickActions(appData.quickActions);
    renderBookingChart(appData.chartData);
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCategoriesPage() {
    renderCategories(appData.categories);
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderRoomsPage() {
    renderRooms(appData.rooms);
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderBookingsPage() {
    renderAllBookings(appData.recentBookings);
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderUsersPage() {
    renderUsers(appData.users);
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderGalleryPage() {
    renderGallery(appData.gallery);
    if(typeof lucide !== 'undefined') lucide.createIcons();
}


// ========================
// EVENT BINDINGS
// ========================

function bindEvents() {
    // Search bindings
    $('#global-search, #booking-search').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $("#bookings-body tr, #bookings-all-body tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('#category-search').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $("#categories-body tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('#room-search').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $("#rooms-body tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Add Category Form Submit
    $('#category-entry-form').on('submit', function(e) {
        e.preventDefault();
        const name = $(this).find('input[type="text"]').val();
        const status = $(this).find('#statusSwitch').is(':checked') ? 'Available' : 'Not Available';
        const newCat = {
            id: Date.now(),
            image: "room-placeholder.jpg",
            name: name,
            status: status
        };
        appData.categories.push(newCat);
        saveData();
        renderCategoriesPage();
        
        $('#toggle-add-category').click(); // close the form map to UI toggle
        this.reset();
    });

    // Add Room Form Submit
    $('#room-entry-form').on('submit', function(e) {
        e.preventDefault();
        const name = $(this).find('input[type="text"]').eq(0).val(); // First input
        const number = $(this).find('input[type="text"]').eq(1).val(); // room num
        const price = $(this).find('input[type="number"]').val() || 250; 
        const status = $(this).find('select').val() || 'Available';
        const category = $(this).find('select').eq(0).val() || 'Deluxe Room';
        
        const newRoom = {
            id: Date.now(),
            image: "room-placeholder.jpg",
            name: name,
            number: number || `RM-${Math.floor(Math.random() * 900) + 100}`,
            category: category,
            price: price,
            status: status
        };
        appData.rooms.push(newRoom);
        saveData();
        renderRoomsPage();
        
        $('#toggle-add-room').click(); // close form UI
        this.reset();
    });

    // Add User Form Submit
    $('#new-user-form').on('submit', function(e) {
        e.preventDefault();
        const name = $(this).find('input').eq(0).val();
        const email = $(this).find('input').eq(1).val();
        const role = $(this).find('select').eq(0).val() || 'Staff';
        const password = $(this).find('input').eq(2).val();
        
        appData.users.push({
            id: Date.now(),
            name: name,
            role: role,
            email: email,
            status: "Active"
        });
        saveData();
        renderUsersPage();
        
        $('#toggle-add-user').click(); // close the form
        this.reset();
    });

    // Accept Booking dynamically (Dashboard whatsapp modal)
    $('#send-whatsapp').on('click', function() {
        alert("WhatsApp message sent, and booking confirmed!");
        // Just mock verifying the first pending booking
        let pending = appData.recentBookings.find(b => b.status === "Pending");
        if(pending) {
            pending.status = "Confirmed";
            saveData();
            if(window.location.pathname.includes('index.html')) renderDashboard();
        }
        $('#whatsapp-overlay').hide();
    });
}


// ========================
// GLOBAL CRUD ACTIONS (binded inline via onclick maps)
// ========================

window.deleteCategory = function(index) {
    if(confirm("Are you sure you want to delete this category?")) {
        appData.categories.splice(index, 1);
        saveData();
        renderCategoriesPage();
    }
};

window.deleteRoom = function(index) {
    if(confirm("Are you sure you want to delete this room?")) {
        appData.rooms.splice(index, 1);
        saveData();
        renderRoomsPage();
    }
};

window.toggleUserStatus = function(index) {
    const usr = appData.users[index];
    usr.status = usr.status === "Active" ? "Inactive" : "Active";
    saveData();
    renderUsersPage();
};

window.deleteUser = function(index) {
    if(confirm("Are you sure you want to permanently remove this user?")) {
        appData.users.splice(index, 1);
        saveData();
        renderUsersPage();
    }
}

window.deleteGalleryItem = function(index) {
    if(confirm("Are you sure you want to delete this image?")) {
        appData.gallery.splice(index, 1);
        saveData();
        renderGalleryPage();
    }
}

// Add generic trigger map for Gallery
$(document).ready(function() {
    $('.upload-btn').on('click', function() {
        const category = prompt("Enter Image Category (e.g. Rooms, Lobby, Exterior):", "Rooms");
        if(!category) return;
        
        appData.gallery.push({
            id: Date.now(),
            image: "room-2.jpg", // placeholder
            category: category
        });
        saveData();
        renderGalleryPage();
    });
});


// ========================
// RENDER HELPERS
// ========================

function renderStats(stats) {
    const statsContainer = $('#stats-container');
    statsContainer.empty();

    const statConfig = [
        { label: "Total Rooms", value: stats.totalRooms, icon: "door-open", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
        { label: "Total Bookings", value: stats.totalBookings, icon: "calendar-days", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)" },
        { label: "Available Rooms", value: stats.availableRooms, icon: "door-closed", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
        { label: "Pending Bookings", value: stats.pendingBookings, icon: "clock", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" }
    ];

    statConfig.forEach(stat => {
        statsContainer.append(`
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="stat-label">${stat.label}</p>
                            <h2 class="stat-value">${stat.value}</h2>
                        </div>
                        <div class="stat-icon" style="background: ${stat.bg}; color: ${stat.color};">
                            <i data-lucide="${stat.icon}" style="width: 24px; height: 24px;"></i>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

function renderBookings(bookings) {
    const tableBody = $('#bookings-body');
    tableBody.empty();

    bookings.forEach(bkg => {
        const statusClass = `badge-${bkg.status.toLowerCase()}`;
        tableBody.append(`
            <tr>
                <td class="fw-bold text-main" style="font-size: 13px;">${bkg.id}</td>
                <td>
                    <p class="mb-0 fw-bold text-main" style="font-size: 14px;">${bkg.customer}</p>
                </td>
                <td class="text-muted" style="font-size: 13px;">${bkg.roomType}</td>
                <td class="text-muted" style="font-size: 13px;">${bkg.checkIn}</td>
                <td>
                    <span class="${statusClass} text-capitalize">${bkg.status}</span>
                </td>
                <td class="fw-bold text-main">$${bkg.amount}</td>
                <td>
                    <button class="btn btn-sm text-muted p-0">
                        <i data-lucide="more-vertical" style="width: 20px; height: 20px;"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function renderAllBookings(bookings) {
    const tableBody = $('#bookings-all-body');
    if (!tableBody.length) return;
    tableBody.empty();

    bookings.forEach(bkg => {
        const statusClass = `badge-${bkg.status.toLowerCase()}`;
        const checkOutDate = new Date(new Date(bkg.checkIn).getTime() + (4 * 24 * 60 * 60 * 1000))
            .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        const paymentMap = {
            Confirmed: { label: "Paid", className: "badge-paid" },
            Pending: { label: "Pending", className: "badge-pending" },
            Cancelled: { label: "Failed", className: "badge-failed" }
        };
        const payment = paymentMap[bkg.status] || { label: "Pending", className: "badge-pending" };

        const actionsHtml = bkg.status === "Pending"
            ? `
                <div class="d-flex justify-content-center gap-2">
                    <button class="action-icon-btn" style="color: #10b981;" title="Confirm">
                        <i data-lucide="check" style="width: 18px; height: 18px;"></i>
                    </button>
                    <button class="action-icon-btn" style="color: #ef4444;" title="Cancel">
                        <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
              `
            : `
                <div class="d-flex justify-content-center">
                    <button class="action-icon-btn open-whatsapp" style="color: #3b82f6;" title="View">
                        <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
              `;

        tableBody.append(`
            <tr style="cursor: pointer;" onclick="window.location.href='booking-details.html?id=${bkg.id}'">
                <td><a href="booking-details.html?id=${bkg.id}" class="fw-bold text-decoration-none" style="color: #00796b; font-size: 13px;">${bkg.id}</a></td>
                <td><span class="fw-bold text-main" style="font-size: 14px;">${bkg.customer}</span></td>
                <td><span class="text-muted" style="font-size: 14px; font-weight: 500;">${bkg.roomType}</span></td>
                <td>
                    <div class="fw-bold text-main" style="font-size: 13px;">${bkg.checkIn}</div>
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${checkOutDate}</div>
                </td>
                <td><span class="${payment.className}">${payment.label}</span></td>
                <td onclick="event.stopPropagation(); $('#whatsapp-overlay').fadeIn();"><span class="${statusClass}">${bkg.status}</span></td>
                <td class="text-center" onclick="event.stopPropagation()">
                    ${actionsHtml}
                </td>
            </tr>
        `);
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderQuickActions(actions) {
    const container = $('#quick-actions-container');
    container.empty();

    const actionIcons = {
        "Add New Room": { icon: "door-open", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.05)" },
        "Add New Category": { icon: "tag", color: "#a855f7", bg: "rgba(168, 85, 247, 0.05)" },
        "Update Settings": { icon: "settings", color: "#64748b", bg: "rgba(100, 116, 139, 0.05)" }
    };

    actions.forEach(action => {
        const cfg = actionIcons[action.name] || { icon: "bi-lightning", color: "var(--primary)", bg: "var(--primary-light)" };
        container.append(`
            <a href="${action.link}" class="quick-action-btn">
                <div class="d-flex align-items-center gap-3">
                    <div class="action-icon" style="background: ${cfg.bg}; color: ${cfg.color};">
                        <i data-lucide="${cfg.icon}" style="width: 18px; height: 18px;"></i>
                    </div>
                    <span>${action.name}</span>
                </div>
                <span class="quick-action-plus"><i data-lucide="plus" style="width: 16px; height: 16px;"></i></span>
            </a>
        `);
    });
}

function renderBookingChart(chartData) {
    const ctx = document.getElementById('bookingChart');
    if (!ctx || !chartData) return;

    // Destroy existing chart if it exists (for hot reloading)
    const existingChart = Chart.getChart("bookingChart");
    if (existingChart) existingChart.destroy();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Monthly Bookings',
                data: chartData.data,
                borderColor: '#009689',
                backgroundColor: 'rgba(0, 150, 137, 0.08)',
                fill: true,
                tension: 0.45,
                borderWidth: 3.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#009689',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(226, 232, 240, 0.4)',
                        borderDash: [5, 5],
                        drawBorder: false
                    },
                    border: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 12 },
                        stepSize: 25
                    }
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function renderCategories(categories) {
    const tableBody = $('#categories-body');
    tableBody.empty();

    categories.forEach((cat, index) => {
        const imgPath = cat.image.startsWith('http') ? cat.image : `assets/img/${cat.image}`;
        const statusClass = cat.status === 'Available' ? 'badge-available' : 'badge-not-available';
        
        tableBody.append(`
            <tr>
                <td style="color: #94a3b8; font-weight: 600;">${index + 1}</td>
                <td>
                    <div class="category-thumb">
                        <img src="${imgPath}" onerror="this.src='assets/img/room-1.jpg'" alt="${cat.name}">
                    </div>
                </td>
                <td class="fw-bold text-main" style="font-size: 15px;">${cat.name}</td>
                <td>
                    <span class="${statusClass}">${cat.status}</span>
                </td>
                <td>
                    <div class="d-flex justify-content-center gap-3">
                        <button class="action-icon-btn" style="color: #3b82f6;">
                            <i data-lucide="pencil" style="width: 18px; height: 18px;"></i>
                        </button>
                        <button class="action-icon-btn" style="color: #ef4444;" onclick="deleteCategory(${index})">
                            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderRooms(rooms) {
    const tableBody = $('#rooms-body');
    tableBody.empty();

    rooms.forEach((room, index) => {
        let statusClass = 'badge-available';
        if (room.status === 'Booked') statusClass = 'badge-booked';
        if (room.status === 'Maintenance') statusClass = 'badge-maintenance';

        const imgPath = room.image.startsWith('http') ? room.image : `assets/img/${room.image}`;

        tableBody.append(`
            <tr>
                <td>
                    <div class="category-thumb">
                        <img src="${imgPath}" onerror="this.src='assets/img/room-2.jpg'" alt="${room.name}">
                    </div>
                </td>
                <td>
                    <div class="room-details-title">${room.name}</div>
                    <div class="room-details-meta">${room.number}</div>
                </td>
                <td style="color: #64748b; font-weight: 500; font-size: 14px; width: 140px;">${room.category}</td>
                <td class="fw-bold text-main" style="font-size: 16px;">$${room.price}</td>
                <td>
                    <span class="${statusClass}">${room.status}</span>
                </td>
                <td>
                    <div class="d-flex justify-content-center gap-3">
                        <button class="action-icon-btn" style="color: #3b82f6;">
                            <i data-lucide="pencil" style="width: 18px; height: 18px;"></i>
                        </button>
                        <button class="action-icon-btn" style="color: #ef4444;" onclick="deleteRoom(${index})">
                            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderUsers(users) {
    const grid = $('.user-grid');
    if (!grid.length) return;
    grid.empty();

    users.forEach((user, index) => {
        let badgeClass = 'badge-active';
        if (user.status === 'Inactive') badgeClass = 'badge-inactive';

        grid.append(`
            <div class="user-card">
                <span class="status-badge ${badgeClass}">${user.status}</span>
                <div class="user-header-content">
                    <div class="user-avatar">
                        <i data-lucide="user" style="width: 28px; height: 28px;"></i>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-role">
                            <i data-lucide="shield-check" style="width: 16px; height: 16px; margin-top: -2px;"></i>
                            ${user.role}
                        </div>
                    </div>
                </div>
                <div class="user-divider"></div>
                <div class="user-email">
                    <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                    ${user.email}
                </div>
                <div class="user-actions">
                    <button class="btn-edit" onclick="toggleUserStatus(${index})">
                        <i data-lucide="${user.status === 'Active' ? 'user-minus' : 'user-check'}" style="width: 18px; height: 18px;"></i>
                        ${user.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn-disable" onclick="deleteUser(${index})">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                        Delete
                    </button>
                </div>
            </div>
        `);
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

window.deleteGalleryItem = function(index) {
    if(confirm("Are you sure you want to delete this image?")) {
        appData.gallery.splice(index, 1);
        saveData();
        renderGalleryPage();
    }
}

// Add generic trigger map for Gallery
$(document).ready(function() {
    $('.upload-btn').on('click', function() {
        const category = prompt("Enter Image Category (e.g. Rooms, Lobby, Exterior):", "Rooms");
        if(!category) return;
        
        appData.gallery.push({
            id: Date.now(),
            image: "room-2.jpg", // placeholder
            category: category
        });
        saveData();
        renderGalleryPage();
    });
});

function renderGallery(gallery) {
    const grid = $('#gallery-container');
    if(!grid.length) return;
    grid.empty();

    gallery.forEach((item, index) => {
        grid.append(`
            <div class="gallery-item">
                <span class="gallery-badge">${item.category}</span>
                <img src="assets/img/${item.image}" alt="${item.category}" onerror="this.src='assets/img/room-1.jpg'">
                <div class="gallery-overlay">
                    <button class="delete-btn" onclick="deleteGalleryItem(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `);
    });
}
