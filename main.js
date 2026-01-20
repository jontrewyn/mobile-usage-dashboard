// Dashboard Data and Configuration
const dashboardData = {
    summary: {
        total_users: 256,
        total_entitled_gb: 24.0,
        total_usage_gb: 767.7,
        overall_usage_percentage: 3198.7
    },
    regional_data: {
        apac: {
            users: 88,
            entitled_gb: 12.0,
            usage_gb: 301.1,
            percentage: 2508.8
        },
        global: {
            users: 168,
            entitled_gb: 12.0,
            usage_gb: 466.6,
            percentage: 3888.6
        }
    },
    top_users: []
};

// Generate mock user data
function generateUserData() {
    const users = [];
    const departments = ['Sales', 'Marketing', 'IT', 'Finance', 'Operations', 'HR', 'Legal'];
    
    for (let i = 1; i <= 40; i++) {
        const region = i <= 20 ? 'APAC' : 'Global';
        const vasCode = Math.random() > 0.5 ? 'RCD3F' : 'RCD3G';
        const usage = Math.random() * 15 + 0.5; // 0.5GB to 15.5GB
        const entitled = 6;
        const percentage = (usage / entitled) * 100;
        
        users.push({
            user_id: `${region === 'APAC' ? 'AP' : 'GL'}_${i.toString().padStart(3, '0')}`,
            region: region,
            vas_code: vasCode,
            department: departments[Math.floor(Math.random() * departments.length)],
            total_usage_gb: Math.round(usage * 100) / 100,
            entitled_gb: entitled,
            usage_percentage: Math.round(percentage * 10) / 10
        });
    }
    
    return users.sort((a, b) => b.total_usage_gb - a.total_usage_gb);
}

// Initialize dashboard
dashboardData.top_users = generateUserData();

// Global variables
let currentPage = 1;
let usersPerPage = 20;
let currentSort = { field: 'total_usage_gb', direction: 'desc' };
let filteredUsers = [...dashboardData.top_users];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    
    // Add typewriter effect to title
    if (typeof Typed !== 'undefined') {
        new Typed('#dashboard-title', {
            strings: ['Roaming Data Usage Dashboard', 'Real-time Analytics Dashboard', 'Network Usage Monitor'],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true
        });
    }
    
    // Update timestamp
    updateTimestamp();
    setInterval(updateTimestamp, 60000); // Update every minute
});

function initializeDashboard() {
    createSpeedometerGauge();
    createRegionalCharts();
    populateUsersTable();
    animateKPIs();
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
    
    // Region filter
    const regionFilter = document.getElementById('region-filter');
    if (regionFilter) {
        regionFilter.addEventListener('change', filterUsers);
    }
    
    // Threshold slider
    const thresholdSlider = document.getElementById('threshold-slider');
    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', function() {
            document.getElementById('threshold-value').textContent = this.value + '%';
        });
    }
}

function animateKPIs() {
    // Animate KPI numbers
    animateNumber('total-users', 0, dashboardData.summary.total_users, 1000);
    animateNumber('active-alerts', 0, 23, 1500);
}

function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function createSpeedometerGauge() {
    const gaugeElement = document.getElementById('speedometer-gauge');
    if (!gaugeElement) return;
    
    const chart = echarts.init(gaugeElement);
    
    const option = {
        series: [{
            name: 'Usage',
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '90%',
            center: ['50%', '75%'],
            axisLine: {
                lineStyle: {
                    width: 20,
                    color: [
                        [0.7, '#22c55e'], // Green for 0-70%
                        [0.9, '#f59e0b'], // Yellow for 70-90%
                        [1.0, '#ef4444']  // Red for 90-100%
                    ]
                }
            },
            pointer: {
                itemStyle: {
                    color: 'auto'
                },
                length: '70%',
                width: 6
            },
            axisTick: {
                distance: -25,
                length: 8,
                lineStyle: {
                    color: '#fff',
                    width: 2
                }
            },
            splitLine: {
                distance: -30,
                length: 15,
                lineStyle: {
                    color: '#fff',
                    width: 2
                }
            },
            axisLabel: {
                color: '#374151',
                distance: -50,
                fontSize: 12,
                formatter: function(value) {
                    return value + '%';
                }
            },
            detail: {
                valueAnimation: true,
                formatter: function(value) {
                    return Math.round(value) + '%';
                },
                color: '#374151',
                fontSize: 24,
                fontWeight: 'bold',
                offsetCenter: [0, '-10%']
            },
            data: [{
                value: Math.min(dashboardData.summary.overall_usage_percentage, 100),
                name: 'Usage %'
            }]
        }]
    };
    
    chart.setOption(option);
    
    // Animate the gauge needle
    setTimeout(() => {
        chart.setOption({
            series: [{
                data: [{
                    value: Math.min(dashboardData.summary.overall_usage_percentage, 100),
                    name: 'Usage %'
                }]
            }]
        });
    }, 500);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

function createRegionalCharts() {
    createRegionalChart('apac-chart', dashboardData.regional_data.apac, '#3b82f6');
    createRegionalChart('global-chart', dashboardData.regional_data.global, '#10b981');
}

function createRegionalChart(elementId, data, color) {
    const chartElement = document.getElementById(elementId);
    if (!chartElement) return;
    
    const chart = echarts.init(chartElement);
    
    const usagePercentage = Math.min((data.usage_gb / data.entitled_gb) * 100, 100);
    const remainingPercentage = 100 - usagePercentage;
    
    const option = {
        series: [{
            name: 'Usage',
            type: 'pie',
            radius: ['60%', '90%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: {
                show: false
            },
            labelLine: {
                show: false
            },
            data: [
                {
                    value: usagePercentage,
                    name: 'Used',
                    itemStyle: {
                        color: color
                    }
                },
                {
                    value: remainingPercentage,
                    name: 'Remaining',
                    itemStyle: {
                        color: '#e5e7eb'
                    }
                }
            ]
        }],
        graphic: {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
                text: Math.round(usagePercentage) + '%',
                fontSize: 24,
                fontWeight: 'bold',
                fill: '#374151'
            }
        }
    };
    
    chart.setOption(option);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

function populateUsersTable() {
    updateUsersTable();
}

function filterUsers() {
    const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
    const regionFilter = document.getElementById('region-filter')?.value || 'all';
    
    filteredUsers = dashboardData.top_users.filter(user => {
        const matchesSearch = user.user_id.toLowerCase().includes(searchTerm) || 
                            user.department.toLowerCase().includes(searchTerm);
        const matchesRegion = regionFilter === 'all' || user.region === regionFilter;
        
        return matchesSearch && matchesRegion;
    });
    
    currentPage = 1;
    updateUsersTable();
}

function sortTable(field) {
    const sortFields = {
        'user_id': 'user_id',
        'region': 'region',
        'department': 'department',
        'usage': 'total_usage_gb'
    };
    
    const actualField = sortFields[field];
    if (!actualField) return;
    
    // Update sort direction
    if (currentSort.field === actualField) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = actualField;
        currentSort.direction = 'desc';
    }
    
    // Update sort indicators
    document.querySelectorAll('[id^="sort-"]').forEach(el => {
        el.textContent = '↕';
    });
    document.getElementById(`sort-${field}`).textContent = currentSort.direction === 'asc' ? '↑' : '↓';
    
    // Sort the filtered users
    filteredUsers.sort((a, b) => {
        let aVal = a[actualField];
        let bVal = b[actualField];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    updateUsersTable();
}

function updateUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageUsers.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50 transition-colors';
        
        const statusColor = user.usage_percentage > 150 ? 'red' : 
                           user.usage_percentage > 100 ? 'amber' : 'green';
        
        const statusText = user.usage_percentage > 150 ? 'Critical' : 
                          user.usage_percentage > 100 ? 'Warning' : 'Normal';
        
        row.innerHTML = `
            <td class="py-3 px-4 font-mono text-sm text-gray-900">${user.user_id}</td>
            <td class="py-3 px-4 text-sm text-gray-700">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${user.region === 'APAC' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                    ${user.region}
                </span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-700">${user.department}</td>
            <td class="py-3 px-4 font-mono text-sm font-medium text-gray-900">${user.total_usage_gb.toFixed(2)}</td>
            <td class="py-3 px-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-${statusColor}-500 h-2 rounded-full" style="width: ${Math.min(user.usage_percentage, 100)}%"></div>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
                    ${statusText}
                </span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update pagination info
    document.getElementById('showing-count').textContent = Math.min(endIndex, filteredUsers.length);
    document.getElementById('total-count').textContent = filteredUsers.length;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateUsersTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateUsersTable();
    }
}

function applyFilters() {
    // Simulate filter application
    showNotification('Filters applied successfully!', 'success');
    refreshData();
}

function refreshData() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            showNotification('Data refreshed successfully!', 'success');
            updateTimestamp();
        }, 2000);
    }
}

function updateTimestamp() {
    const timestamp = document.getElementById('last-updated');
    if (timestamp) {
        const now = new Date();
        timestamp.textContent = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(',', '');
    }
}

function exportCSV() {
    // Simulate CSV export
    showNotification('CSV export started. Download will begin shortly.', 'info');
    
    setTimeout(() => {
        const csvContent = generateCSVContent();
        downloadFile(csvContent, 'roaming-data-usage.csv', 'text/csv');
        showNotification('CSV file downloaded successfully!', 'success');
    }, 1500);
}

function exportPDF() {
    showNotification('PDF report generation started.', 'info');
    
    setTimeout(() => {
        showNotification('PDF report generated successfully!', 'success');
    }, 3000);
}

function scheduleReport() {
    showNotification('Report scheduling feature coming soon!', 'info');
}

function generateCSVContent() {
    const headers = ['User ID', 'Region', 'Department', 'Usage (GB)', 'Entitled (GB)', 'Usage %'];
    const rows = filteredUsers.map(user => [
        user.user_id,
        user.region,
        user.department,
        user.total_usage_gb,
        user.entitled_gb,
        user.usage_percentage
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationColor(type)}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutCubic'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInCubic',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    return colors[type] || colors.info;
}

// Simulate real-time data updates
setInterval(() => {
    // Randomly update some metrics to simulate real-time data
    const alertsElement = document.getElementById('active-alerts');
    if (alertsElement && Math.random() > 0.7) {
        const currentAlerts = parseInt(alertsElement.textContent);
        const newAlerts = Math.max(0, currentAlerts + (Math.random() > 0.5 ? 1 : -1));
        alertsElement.textContent = newAlerts;
    }
}, 30000); // Every 30 seconds