// Global variables
let scene, camera, renderer, packageBox, gears = [];
let revenueChart, expenseChart;
let currentSection = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initLoadingScreen();
    initThreeJS();
    initNavigation();
    initCharts();
    initAnimations();
    initData();
    initResponsive();
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const progress = document.querySelector('.loading-progress');
    
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 15;
        progress.style.width = Math.min(loadProgress, 100) + '%';
        
        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    startAnimations();
                }, 500);
            }, 500);
        }
    }, 200);
}

// Three.js 3D Background
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    const container = canvas.parentElement;
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00FF99, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00A86B, 0.8, 100);
    pointLight.position.set(-10, 0, 10);
    scene.add(pointLight);
    
    // Create animated packaging box
    createPackagingBox();
    
    // Create floating gears
    createFloatingGears();
    
    // Create particle system
    createParticles();
    
    camera.position.z = 15;
    camera.position.y = 2;
    
    // Animation loop
    animate();
    
    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

function createPackagingBox() {
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00A86B,
        transparent: true,
        opacity: 0.8,
        wireframe: false
    });
    
    packageBox = new THREE.Mesh(geometry, material);
    packageBox.position.set(0, 0, 0);
    scene.add(packageBox);
    
    // Add edges for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00FF99, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    packageBox.add(wireframe);
}

function createFloatingGears() {
    const gearGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
    
    for (let i = 0; i < 5; i++) {
        const gearMaterial = new THREE.MeshPhongMaterial({
            color: i % 2 === 0 ? 0x00FF99 : 0x00A86B,
            transparent: true,
            opacity: 0.7
        });
        
        const gear = new THREE.Mesh(gearGeometry, gearMaterial);
        gear.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        gear.rotation.x = Math.random() * Math.PI;
        gear.rotation.y = Math.random() * Math.PI;
        
        gears.push(gear);
        scene.add(gear);
    }
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00FF99,
        transparent: true,
        opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Rotate packaging box
    if (packageBox) {
        packageBox.rotation.x = time * 0.5;
        packageBox.rotation.y = time * 0.3;
        packageBox.position.y = Math.sin(time) * 0.5;
    }
    
    // Animate gears
    gears.forEach((gear, index) => {
        gear.rotation.z += 0.01 * (index % 2 === 0 ? 1 : -1);
        gear.position.y += Math.sin(time + index) * 0.01;
    });
    
    // Camera movement
    camera.position.x = Math.sin(time * 0.1) * 2;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('three-canvas').parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('themeToggle');
    
    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.dataset.section;
            showSection(sectionName);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    // Theme toggle
    initThemeToggle();
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Load section-specific data
        loadSectionData(sectionName);
    }
}

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.classList.add(savedTheme + '-theme');
    updateThemeIcon(savedTheme);
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Remove current theme class and add new one
        body.classList.remove(currentTheme + '-theme');
        body.classList.add(newTheme + '-theme');
        
        // Update icon
        updateThemeIcon(newTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Update charts colors if they exist
        updateChartColors(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

function updateChartColors(theme) {
    if (revenueChart) {
        const colors = theme === 'light' ? {
            border: '#00A86B',
            background: 'rgba(0, 168, 107, 0.1)',
            grid: 'rgba(0, 168, 107, 0.1)',
            text: '#2c3e50'
        } : {
            border: '#00FF99',
            background: 'rgba(0, 255, 153, 0.1)',
            grid: 'rgba(0, 255, 153, 0.1)',
            text: '#ffffff'
        };
        
        revenueChart.data.datasets[0].borderColor = colors.border;
        revenueChart.data.datasets[0].backgroundColor = colors.background;
        revenueChart.options.scales.y.grid.color = colors.grid;
        revenueChart.options.scales.x.grid.color = colors.grid;
        revenueChart.options.scales.y.ticks.color = colors.text;
        revenueChart.options.scales.x.ticks.color = colors.text;
        revenueChart.update();
    }
    
    if (expenseChart) {
        const colors = theme === 'light' ? {
            border: '#00A86B',
            background: 'rgba(0, 168, 107, 0.1)',
            grid: 'rgba(0, 168, 107, 0.1)',
            text: '#2c3e50'
        } : {
            border: '#00FF99',
            background: 'rgba(0, 255, 153, 0.1)',
            grid: 'rgba(0, 255, 153, 0.1)',
            text: '#ffffff'
        };
        
        expenseChart.data.datasets[0].borderColor = colors.border;
        expenseChart.data.datasets[0].backgroundColor = colors.background;
        expenseChart.options.scales.y.grid.color = colors.grid;
        expenseChart.options.scales.x.grid.color = colors.grid;
        expenseChart.options.scales.y.ticks.color = colors.text;
        expenseChart.options.scales.x.ticks.color = colors.text;
        expenseChart.update();
    }
}

// Charts initialization
function initCharts() {
    initRevenueChart();
    initExpenseChart();
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 255, 153, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 128, 255, 0.1)');
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [85000, 92000, 88000, 95000, 110000, 125000],
                backgroundColor: gradient,
                borderColor: '#00FF99',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00FF99',
                pointBorderColor: '#121212',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 128, 255, 0.1)'
                    },
                    ticks: {
                        color: '#E0E0E0',
                        callback: function(value) {
                            return '$' + (value / 1000) + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 128, 255, 0.1)'
                    },
                    ticks: {
                        color: '#E0E0E0'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function initExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Raw Materials', 'Labor', 'Equipment', 'Utilities', 'Other'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#0080FF',
                    '#00FF99',
                    '#FFB74D',
                    '#FF6B6B',
                    '#9C27B0'
                ],
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#E0E0E0',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

// Animations and counters
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Counter animations
    animateCounters();
    
    // Scroll triggered animations
    gsap.utils.toArray('.kpi-card').forEach(card => {
        gsap.fromTo(card, 
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.8,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    end: "bottom 20%"
                }
            }
        );
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const isPrice = counter.textContent.includes('$');
        
        gsap.to({ value: 0 }, {
            value: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
                const current = Math.round(this.targets()[0].value);
                if (isPrice) {
                    counter.textContent = '$' + current.toLocaleString();
                } else {
                    counter.textContent = current.toLocaleString();
                }
            }
        });
    });
}

function startAnimations() {
    // Animate hero stats
    gsap.fromTo('.stat-item', 
        { y: 100, opacity: 0, rotationX: 45 },
        { 
            y: 0, 
            opacity: 1, 
            rotationX: 0,
            duration: 1,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }
    );
    
    // Animate navigation
    gsap.fromTo('.nav-item', 
        { x: -50, opacity: 0 },
        { 
            x: 0, 
            opacity: 1, 
            duration: 0.6,
            stagger: 0.1,
            delay: 0.5,
            ease: "power2.out"
        }
    );
}

// Data management
function initData() {
    loadOrdersData();
    loadPaymentsData();
    loadEmployeesData();
    loadInventoryData();
    loadAlertsData();
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'orders':
            loadOrdersData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'employees':
            loadEmployeesData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'alerts':
            loadAlertsData();
            break;
    }
}

// Orders data
function loadOrdersData() {
    const ordersData = [
        {
            id: 'ORD-001',
            client: 'ABC Corporation',
            product: 'Plastic Bottles',
            quantity: 5000,
            status: 'production',
            progress: 65,
            dueDate: '2024-02-15',
            value: 12500
        },
        {
            id: 'ORD-002',
            client: 'XYZ Industries',
            product: 'Food Containers',
            quantity: 3000,
            status: 'ready',
            progress: 100,
            dueDate: '2024-02-10',
            value: 8500
        },
        {
            id: 'ORD-003',
            client: 'Green Packaging Co',
            product: 'Eco Bags',
            quantity: 2000,
            status: 'received',
            progress: 15,
            dueDate: '2024-02-20',
            value: 6800
        }
    ];
    
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = ordersData.map(order => `
        <div class="order-card" data-status="${order.status}">
            <div class="order-header">
                <div>
                    <h4>${order.id}</h4>
                    <p>${order.client}</p>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Product:</strong> ${order.product}</p>
                <p><strong>Quantity:</strong> ${order.quantity.toLocaleString()} units</p>
                <p><strong>Value:</strong> $${order.value.toLocaleString()}</p>
                <p><strong>Due Date:</strong> ${order.dueDate}</p>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${order.progress}%"></div>
            </div>
            <p class="progress-text">${order.progress}% Complete</p>
        </div>
    `).join('');
    
    // Add filter functionality
    initOrderFilters();
}

function initOrderFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const orderCards = document.querySelectorAll('.order-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.dataset.status;
            
            // Update active filter
            filterBtns.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter orders
            orderCards.forEach(card => {
                if (status === 'all' || card.dataset.status === status) {
                    card.style.display = 'block';
                    gsap.fromTo(card, 
                        { opacity: 0, y: 20 }, 
                        { opacity: 1, y: 0, duration: 0.3 }
                    );
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Payments data
function loadPaymentsData() {
    generatePaymentCalendar();
    loadRecentPayments();
}

function generatePaymentCalendar() {
    const calendar = document.getElementById('paymentCalendar');
    if (!calendar) return;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate();
    
    const paymentDays = [5, 12, 18, 25]; // Sample payment due dates
    const paidDays = [5, 12]; // Paid dates
    const overdueDays = []; // Overdue dates
    
    let calendarHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-header">${day}</div>`;
    });
    
    // Add empty cells for days before month starts
    const firstDay = new Date(currentDate.getFullYear(), currentMonth, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        let classes = 'calendar-day';
        if (paidDays.includes(day)) classes += ' paid';
        else if (paymentDays.includes(day)) classes += ' due';
        else if (overdueDays.includes(day)) classes += ' overdue';
        
        calendarHTML += `<div class="${classes}">${day}</div>`;
    }
    
    calendar.innerHTML = calendarHTML;
}

function loadRecentPayments() {
    const paymentsData = [
        {
            client: 'ABC Corporation',
            amount: 12500,
            date: '2024-01-05',
            status: 'paid',
            method: 'Bank Transfer'
        },
        {
            client: 'XYZ Industries',
            amount: 8500,
            date: '2024-01-12',
            status: 'paid',
            method: 'Check'
        },
        {
            client: 'Green Packaging Co',
            amount: 6800,
            date: '2024-01-18',
            status: 'pending',
            method: 'Credit Card'
        }
    ];
    
    const paymentsList = document.getElementById('paymentsList');
    if (!paymentsList) return;
    
    paymentsList.innerHTML = paymentsData.map(payment => `
        <div class="payment-item">
            <div class="payment-details">
                <h4>${payment.client}</h4>
                <p>$${payment.amount.toLocaleString()} - ${payment.method}</p>
                <span class="payment-date">${payment.date}</span>
            </div>
            <span class="payment-status ${payment.status}">${payment.status}</span>
        </div>
    `).join('');
}

// Employees data
function loadEmployeesData() {
    const employeesData = [
        {
            id: 1,
            name: 'Ahmed Hassan',
            role: 'Production Manager',
            attendance: 'present',
            salary: 4500,
            absences: 2
        },
        {
            id: 2,
            name: 'Fatima Ali',
            role: 'Quality Control',
            attendance: 'present',
            salary: 3800,
            absences: 1
        },
        {
            id: 3,
            name: 'Omar Khan',
            role: 'Machine Operator',
            attendance: 'absent',
            salary: 3200,
            absences: 5
        },
        {
            id: 4,
            name: 'Aisha Mohamed',
            role: 'Packaging Supervisor',
            attendance: 'present',
            salary: 4000,
            absences: 0
        }
    ];
    
    const employeeCards = document.getElementById('employeeCards');
    if (!employeeCards) return;
    
    employeeCards.innerHTML = employeesData.map(employee => `
        <div class="employee-card">
            <div class="employee-header">
                <div class="employee-avatar">${employee.name.charAt(0)}</div>
                <div class="employee-info">
                    <h4>${employee.name}</h4>
                    <p>${employee.role}</p>
                </div>
                <span class="attendance-status ${employee.attendance}">${employee.attendance}</span>
            </div>
            <div class="employee-details">
                <p><strong>Monthly Salary:</strong> $${employee.salary.toLocaleString()}</p>
                <p><strong>Absences:</strong> ${employee.absences} days</p>
                <p><strong>Salary Deduction:</strong> $${(employee.absences * 150).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
    
    generateAttendanceHeatmap();
}

function generateAttendanceHeatmap() {
    const heatmap = document.getElementById('attendanceHeatmap');
    if (!heatmap) return;
    
    // Create a simple attendance heatmap for the past 30 days
    let heatmapHTML = '<div class="heatmap-grid">';
    
    for (let day = 0; day < 30; day++) {
        const attendanceRate = Math.random();
        let intensity = '';
        
        if (attendanceRate > 0.9) intensity = 'high';
        else if (attendanceRate > 0.7) intensity = 'medium';
        else if (attendanceRate > 0.5) intensity = 'low';
        else intensity = 'very-low';
        
        heatmapHTML += `<div class="heatmap-cell ${intensity}" title="Day ${day + 1}: ${Math.round(attendanceRate * 100)}% attendance"></div>`;
    }
    
    heatmapHTML += '</div>';
    heatmap.innerHTML = heatmapHTML;
}

// Inventory data
function loadInventoryData() {
    const inventoryData = [
        {
            name: 'Plastic Pellets',
            category: 'Raw Material',
            stock: 15000,
            capacity: 20000,
            level: 'full',
            unit: 'kg'
        },
        {
            name: 'Colorants',
            category: 'Raw Material',
            stock: 800,
            capacity: 1500,
            level: 'low',
            unit: 'kg'
        },
        {
            name: 'Bottles (500ml)',
            category: 'Finished Product',
            stock: 250,
            capacity: 5000,
            level: 'critical',
            unit: 'units'
        },
        {
            name: 'Food Containers',
            category: 'Finished Product',
            stock: 3500,
            capacity: 5000,
            level: 'full',
            unit: 'units'
        }
    ];
    
    const inventoryItems = document.getElementById('inventoryItems');
    if (!inventoryItems) return;
    
    inventoryItems.innerHTML = inventoryData.map(item => {
        const percentage = Math.round((item.stock / item.capacity) * 100);
        return `
            <div class="inventory-item">
                <h4>${item.name}</h4>
                <p class="category">${item.category}</p>
                <div class="stock-info">
                    <span>${item.stock.toLocaleString()} ${item.unit}</span>
                    <span class="capacity">/ ${item.capacity.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="stock-level">
                    <span class="stock-indicator ${item.level}"></span>
                    <span>${percentage}% Full</span>
                </div>
            </div>
        `;
    }).join('');
}

// Alerts data
function loadAlertsData() {
    const alertsData = [
        {
            type: 'warning',
            icon: 'fas fa-exclamation-triangle',
            title: 'Low Stock Alert',
            message: 'Colorants stock is running low (800kg remaining)',
            time: '2 hours ago'
        },
        {
            type: 'error',
            icon: 'fas fa-times-circle',
            title: 'Employee Absence',
            message: 'Omar Khan has been absent for 3 consecutive days',
            time: '4 hours ago'
        },
        {
            type: 'info',
            icon: 'fas fa-info-circle',
            title: 'Payment Received',
            message: 'ABC Corporation payment of $12,500 has been received',
            time: '6 hours ago'
        },
        {
            type: 'warning',
            icon: 'fas fa-clock',
            title: 'Order Delay',
            message: 'Order ORD-003 may be delayed due to material shortage',
            time: '1 day ago'
        }
    ];
    
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;
    
    alertsContainer.innerHTML = alertsData.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">
                <i class="${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `).join('');
    
    // Mark all read functionality
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            const alertItems = document.querySelectorAll('.alert-item');
            alertItems.forEach(item => {
                item.style.opacity = '0.5';
            });
            
            // Update notification badge
            const notificationBadge = document.querySelector('.notification-badge');
            if (notificationBadge) {
                notificationBadge.textContent = '0';
                notificationBadge.style.display = 'none';
            }
        });
    }
}

// Responsive design
function initResponsive() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Mobile menu toggle
    function handleResize() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    // Touch gestures for mobile
    let startX = 0;
    let currentX = 0;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', () => {
        const diffX = currentX - startX;
        
        if (Math.abs(diffX) > 50) {
            if (diffX > 0 && startX < 50) {
                // Swipe right from left edge - open sidebar
                sidebar.classList.add('open');
            } else if (diffX < 0) {
                // Swipe left - close sidebar
                sidebar.classList.remove('open');
            }
        }
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

// Real-time updates simulation
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Update KPI values with slight variations
        updateKPIValues();
        
        // Update charts with new data
        updateCharts();
        
        // Simulate new alerts
        if (Math.random() > 0.95) {
            addNewAlert();
        }
    }, 30000); // Update every 30 seconds
}

function updateKPIValues() {
    const kpiValues = document.querySelectorAll('.kpi-value[data-count]');
    
    kpiValues.forEach(value => {
        const currentValue = parseInt(value.dataset.count);
        const variation = Math.round(currentValue * (Math.random() * 0.02 - 0.01)); // ±1% variation
        const newValue = currentValue + variation;
        
        value.dataset.count = newValue;
        if (value.textContent.includes('$')) {
            value.textContent = '$' + newValue.toLocaleString();
        } else {
            value.textContent = newValue.toLocaleString();
        }
    });
}

function updateCharts() {
    if (revenueChart && Math.random() > 0.8) {
        const newData = revenueChart.data.datasets[0].data.map(value => 
            value + Math.round(value * (Math.random() * 0.02 - 0.01))
        );
        revenueChart.data.datasets[0].data = newData;
        revenueChart.update('none');
    }
}

function addNewAlert() {
    const alertTypes = ['info', 'warning', 'error'];
    const alertMessages = [
        'New order received from client',
        'Production target exceeded',
        'Equipment maintenance required',
        'Quality check completed'
    ];
    
    const newAlert = {
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        icon: 'fas fa-bell',
        title: 'System Update',
        message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
        time: 'Just now'
    };
    
    const alertsContainer = document.getElementById('alertsContainer');
    if (alertsContainer && currentSection === 'alerts') {
        const alertHTML = `
            <div class="alert-item ${newAlert.type}" style="opacity: 0;">
                <div class="alert-icon">
                    <i class="${newAlert.icon}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${newAlert.title}</div>
                    <div class="alert-message">${newAlert.message}</div>
                </div>
                <div class="alert-time">${newAlert.time}</div>
            </div>
        `;
        
        alertsContainer.insertAdjacentHTML('afterbegin', alertHTML);
        
        // Animate new alert
        const newAlertElement = alertsContainer.firstElementChild;
        gsap.to(newAlertElement, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // Update notification badge
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            const currentCount = parseInt(notificationBadge.textContent) || 0;
            notificationBadge.textContent = currentCount + 1;
            notificationBadge.style.display = 'inline';
        }
    }
}

// Start real-time updates
setTimeout(simulateRealTimeUpdates, 5000);