// Cloud Provider SLA Data
const slaData = {
    compute: {
        aws: { name: 'AWS EC2', sla: 99.99, multiaz: 99.99 },
        azure: { name: 'Azure VMs', sla: 99.99, multiaz: 99.99 },
        gcp: { name: 'Google Compute Engine', sla: 99.99, multiaz: 99.99 },
        digitalocean: { name: 'DigitalOcean Droplets', sla: 99.99 },
        linode: { name: 'Linode Instances', sla: 99.99 },
        vultr: { name: 'Vultr Instances', sla: 99.99 },
        heroku: { name: 'Heroku Dynos', sla: 99.95 }
    },
    database: {
        aws: { name: 'AWS RDS', sla: 99.95, multiaz: 99.99 },
        azure: { name: 'Azure SQL Database', sla: 99.99 },
        gcp: { name: 'Google Cloud SQL', sla: 99.95, multiaz: 99.99 },
        digitalocean: { name: 'DO Managed Databases', sla: 99.95 },
        linode: { name: 'Linode Managed Databases', sla: 99.95 },
        vultr: { name: 'Vultr Managed Databases', sla: 99.0 },
        heroku: { name: 'Heroku Postgres', sla: 99.95 }
    },
    storage: {
        aws: { name: 'AWS S3', sla: 99.99 },
        azure: { name: 'Azure Blob Storage', sla: 99.99 },
        gcp: { name: 'Google Cloud Storage', sla: 99.99 },
        digitalocean: { name: 'DO Spaces', sla: 99.99 },
        linode: { name: 'Linode Object Storage', sla: 99.99 },
        vultr: { name: 'Vultr Object Storage', sla: 99.99 },
        heroku: { name: 'Heroku Storage', sla: 99.95 }
    },
    cdn: {
        aws: { name: 'AWS CloudFront', sla: 99.99 },
        azure: { name: 'Azure CDN', sla: 99.99 },
        gcp: { name: 'Google Cloud CDN', sla: 99.99 },
        digitalocean: { name: 'DO CDN', sla: 99.99 },
        linode: { name: 'Linode CDN', sla: 99.99 },
        vultr: { name: 'Vultr CDN', sla: 99.99 },
        heroku: { name: 'Heroku CDN', sla: 99.95 }
    },
    loadbalancer: {
        aws: { name: 'AWS ELB/ALB', sla: 99.99 },
        azure: { name: 'Azure Load Balancer', sla: 99.99 },
        gcp: { name: 'Google Cloud LB', sla: 99.99 },
        digitalocean: { name: 'DO Load Balancer', sla: 99.99 },
        linode: { name: 'Linode Load Balancer', sla: 99.99 },
        vultr: { name: 'Vultr Load Balancer', sla: 99.0 },
        heroku: { name: 'Heroku Router', sla: 99.95 }
    },
    multiaz: {
        aws: { name: 'AWS Multi-AZ', sla: 99.99 },
        azure: { name: 'Azure Availability Sets', sla: 99.99 },
        gcp: { name: 'GCP Multi-Zone', sla: 99.99 },
        digitalocean: { name: 'DO Regions', sla: 99.95 },
        linode: { name: 'Linode Regions', sla: 99.95 },
        vultr: { name: 'Vultr Regions', sla: 99.95 },
        heroku: { name: 'Heroku Regions', sla: 99.9 }
    }
};

function updateProviders() {
    const serviceType = document.getElementById('serviceType').value;
    const data = slaData[serviceType] || slaData.compute;
    updateComparison();
}

function updateComparison() {
    const selectedProviders = Array.from(document.querySelectorAll('.checkbox-label input:checked')).map(el => el.value);
    const serviceType = document.getElementById('serviceType').value;
    const data = slaData[serviceType] || slaData.compute;

    if (selectedProviders.length === 0) {
        document.getElementById('comparisonResults').style.display = 'none';
        return;
    }

    // Build comparison table
    const tbody = document.getElementById('slaTableBody');
    tbody.innerHTML = '';

    const chartsHtml = [];

    selectedProviders.forEach(provider => {
        const providerData = data[provider];
        if (!providerData) return;

        const sla = providerData.sla;
        const downtime = calculateDowntime(sla);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${providerData.name}</td>
            <td><strong>${sla}%</strong></td>
            <td>${downtime.annualShort}</td>
            <td>${downtime.monthlyShort}</td>
            <td>${downtime.dailyShort}</td>
        `;
        tbody.appendChild(row);

        // Build downtime bar chart
        chartsHtml.push(`
            <div class="downtime-bar">
                <div class="downtime-bar-label">${providerData.name}</div>
                <div class="downtime-bar-value" style="width: ${100 - sla}px; min-width: 10px;">
                    ${downtime.annualShort}
                </div>
            </div>
        `);
    });

    document.getElementById('downtimeCharts').innerHTML = chartsHtml.join('');
    document.getElementById('comparisonResults').style.display = 'block';
}

function calculateDowntime(slaPercentage) {
    // Calculate for 365 days in a year
    const uptime = slaPercentage / 100;
    const downtime = 1 - uptime;

    // Annual (365 days)
    const secondsPerYear = 365 * 24 * 60 * 60;
    const downtimeSecondsYear = secondsPerYear * downtime;
    
    // Monthly (365/12 days average)
    const secondsPerMonth = (365 / 12) * 24 * 60 * 60;
    const downtimeSecondsMonth = secondsPerMonth * downtime;

    // Daily (24 hours)
    const secondsPerDay = 24 * 60 * 60;
    const downtimeSecondsDay = secondsPerDay * downtime;

    // Hourly
    const secondsPerHour = 60 * 60;
    const downtimeSecondsHour = secondsPerHour * downtime;

    return {
        annualShort: formatDuration(downtimeSecondsYear),
        monthlyShort: formatDuration(downtimeSecondsMonth),
        dailyShort: formatDuration(downtimeSecondsDay),
        hourlyShort: formatDuration(downtimeSecondsHour),
        annualLong: formatDurationLong(downtimeSecondsYear),
        monthlyLong: formatDurationLong(downtimeSecondsMonth),
        dailyLong: formatDurationLong(downtimeSecondsDay),
        hourlyLong: formatDurationLong(downtimeSecondsHour)
    };
}

function formatDuration(seconds) {
    if (seconds < 60) return Math.round(seconds) + 's';
    if (seconds < 3600) return (seconds / 60).toFixed(1) + 'm';
    if (seconds < 86400) return (seconds / 3600).toFixed(2) + 'h';
    return (seconds / 86400).toFixed(2) + 'd';
}

function formatDurationLong(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return days + 'd ' + hours + 'h ' + minutes + 'm';
    if (hours > 0) return hours + 'h ' + minutes + 'm ' + secs + 's';
    if (minutes > 0) return minutes + 'm ' + secs + 's';
    return secs + 's';
}

function setUptime(percentage) {
    document.getElementById('uptimePercentage').value = percentage;
    document.getElementById('uptimeValue').textContent = percentage + '%';
    calculateDowntime();
}

function calculateDowntime() {
    const uptimePercentage = parseFloat(document.getElementById('uptimePercentage').value);

    if (isNaN(uptimePercentage) || uptimePercentage < 0 || uptimePercentage > 100) {
        return;
    }

    document.getElementById('uptimeValue').textContent = uptimePercentage.toFixed(3) + '%';

    const downtime = calculateDowntime(uptimePercentage);

    document.getElementById('annualDowntime').textContent = downtime.annualLong;
    document.getElementById('monthlyDowntime').textContent = downtime.monthlyLong;
    document.getElementById('dailyDowntime').textContent = downtime.dailyLong;
    document.getElementById('hourlyDowntime').textContent = downtime.hourlyLong;

    // Context text
    let contextText = '';
    if (uptimePercentage >= 99.999) {
        contextText = 'Ultra-critical infrastructure. Requires multi-region active-active deployment. Only ~5 minutes downtime per year.';
    } else if (uptimePercentage >= 99.99) {
        contextText = 'Mission-critical applications. Use multi-AZ deployment with automated failover. Most financial & healthcare systems use this tier.';
    } else if (uptimePercentage >= 99.95) {
        contextText = 'High-availability production systems. Multi-AZ deployments recommended. Good for SaaS and e-commerce.';
    } else if (uptimePercentage >= 99.9) {
        contextText = 'Standard production workloads. Most web applications use this. ~21 minutes downtime per month is acceptable for most use cases.';
    } else if (uptimePercentage >= 99) {
        contextText = 'Development/staging or non-critical systems. ~87 hours downtime per year. Not suitable for production.';
    } else {
        contextText = 'Very low availability. Not recommended for any production use.';
    }

    document.getElementById('contextText').textContent = contextText;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateComparison();
    calculateDowntime();
});
