const STORAGE_KEY = 'timecapsule_data_v2';
let capsules = [];
let selectedType = 'personal';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing TimeCapsule...');
    
    // Show page loader
    setTimeout(function() {
        document.getElementById('pageLoader').classList.add('hidden');
    }, 2500);
    
    loadCapsules();
    setMinDate();
    
    const unlockedCount = checkUnlockedCapsules();
    if (unlockedCount > 0) {
        console.log('🎉 ' + unlockedCount + ' capsule(s) have been unlocked!');
    }
    
    showMyCapsules();
    updateCapsuleCount();
    requestNotificationPermission();
    
    console.log('✅ TimeCapsule initialized. Capsules loaded:', capsules.length);
});

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(function(permission) {
            console.log('Notification permission:', permission);
        });
    }
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('unlockDate').min = today;
}

function selectType(type) {
    selectedType = type;
    document.querySelectorAll('.type-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    const selected = document.querySelector('[data-type="' + type + '"]');
    if (selected) {
        selected.classList.add('selected');
    }
}

function setDuration() {
    const duration = parseInt(document.getElementById('duration').value);
    const date = new Date();
    if (duration === 0) {
        document.getElementById('unlockDate').value = date.toISOString().split('T')[0];
    } else if (duration) {
        date.setFullYear(date.getFullYear() + duration);
        document.getElementById('unlockDate').value = date.toISOString().split('T')[0];
    }
}

function showCreateForm() {
    document.getElementById('createForm').classList.add('active');
    document.getElementById('capsulesView').classList.remove('active');
}

function showMyCapsules() {
    document.getElementById('createForm').classList.remove('active');
    document.getElementById('capsulesView').classList.add('active');
    displayCapsules();
    updateCapsuleCount();
}

function validateForm() {
    const title = document.getElementById('capsuleTitle').value.trim();
    const message = document.getElementById('capsuleMessage').value.trim();
    const unlockDate = document.getElementById('unlockDate').value;

    if (!title) {
        showError('Please enter a capsule title');
        return false;
    }

    if (!message) {
        showError('Please enter a message');
        return false;
    }

    if (!unlockDate) {
        showError('Please select an unlock date');
        return false;
    }

    return true;
}

function createCapsule() {
    console.log('📝 Creating new capsule...');
    
    if (!validateForm()) {
        return;
    }

    // Show creating loader
    const creatingLoader = document.getElementById('creatingLoader');
    creatingLoader.classList.add('show');

    // Use setTimeout to ensure animation completes
    setTimeout(function() {
        try {
            const title = document.getElementById('capsuleTitle').value.trim();
            const message = document.getElementById('capsuleMessage').value.trim();
            const unlockDate = document.getElementById('unlockDate').value;
            const predictions = document.getElementById('predictions').value.trim();
            const customType = document.getElementById('customType').value.trim();
            const password = document.getElementById('capsulePassword').value;
            const recipientEmail = document.getElementById('recipientEmail').value.trim();

            const finalType = customType || selectedType;

            const capsule = {
                id: Date.now(),
                type: finalType,
                customType: customType ? true : false,
                title: title,
                message: message,
                unlockDate: unlockDate,
                predictions: predictions,
                createdDate: new Date().toISOString().split('T')[0],
                opened: false,
                hasPassword: password ? true : false,
                password: password || null,
                recipientEmail: recipientEmail || null,
                notificationSent: false
            };

            capsules.push(capsule);
            console.log('✅ Capsule created:', capsule);
            
            if (saveCapsules()) {
                console.log('💾 Capsule saved to localStorage');
                sendBrowserNotification('🎉 Time Capsule Created!', '"' + title + '" will unlock on ' + formatDate(unlockDate));
                
                showSaveNotification();
                clearForm();
                
                // Hide creating loader and show capsules
                setTimeout(function() {
                    creatingLoader.classList.remove('show');
                    showMyCapsules();
                }, 100);
            } else {
                console.error('❌ Failed to save capsule');
                creatingLoader.classList.remove('show');
                showError('Failed to save capsule');
                capsules.pop();
            }
        } catch (e) {
            console.error('❌ Error creating capsule:', e);
            creatingLoader.classList.remove('show');
            showError('Error creating capsule');
        }
    }, 1800);
}

function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⏳</text></svg>'
        });
    }
}

function clearForm() {
    document.getElementById('capsuleTitle').value = '';
    document.getElementById('capsuleMessage').value = '';
    document.getElementById('unlockDate').value = '';
    document.getElementById('predictions').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('customType').value = '';
    document.getElementById('capsulePassword').value = '';
    document.getElementById('recipientEmail').value = '';
    selectedType = 'personal';
    document.querySelectorAll('.type-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    const personalType = document.querySelector('[data-type="personal"]');
    if (personalType) {
        personalType.classList.add('selected');
    }
}

function displayCapsules() {
    const grid = document.getElementById('capsulesGrid');
    
    if (capsules.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No Time Capsules Yet</h3><p>Create your first time capsule to get started!</p><button class="btn btn-primary" onclick="showCreateForm()" style="margin-top: 20px;">Create Now</button></div>';
        return;
    }

    const sortedCapsules = capsules.slice().sort(function(a, b) {
        return new Date(a.unlockDate) - new Date(b.unlockDate);
    });

    grid.innerHTML = sortedCapsules.map(function(capsule) {
        const icon = getTypeIcon(capsule.type);
        const isUnlocked = isDateUnlocked(capsule.unlockDate);
        const statusClass = isUnlocked ? 'status-unlocked' : 'status-locked';
        const statusText = isUnlocked ? '🔓 Unlocked' : '🔒 Locked';
        const hasPasswordIcon = capsule.hasPassword ? ' 🔐' : '';
        const sharedIcon = capsule.recipientEmail ? ' 📧' : '';

        return '<div class="capsule-card" onclick="openCapsule(' + capsule.id + ')">' +
            '<div class="capsule-icon">' + icon + '</div>' +
            '<div class="capsule-title">' + escapeHtml(capsule.title) + hasPasswordIcon + sharedIcon + '</div>' +
            (capsule.customType ? '<div style="color: #ef4444; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600;">Custom: ' + escapeHtml(capsule.type) + '</div>' : '') +
            (capsule.recipientEmail ? '<div style="color: #60a5fa; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600;">📧 ' + escapeHtml(capsule.recipientEmail) + '</div>' : '') +
            '<div class="capsule-date">Created: ' + formatDate(capsule.createdDate) + '</div>' +
            '<div class="capsule-date">Unlocks: ' + formatDate(capsule.unlockDate) + '</div>' +
            '<span class="capsule-status ' + statusClass + '">' + statusText + '</span>' +
            '</div>';
    }).join('');
}

function isDateUnlocked(unlockDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unlock = new Date(unlockDate);
    unlock.setHours(0, 0, 0, 0);
    return today >= unlock;
}

function openCapsule(id) {
    // Show opening loader
    const openingLoader = document.getElementById('openingLoader');
    openingLoader.classList.add('show');

    setTimeout(function() {
        try {
            const capsule = capsules.find(function(c) {
                return c.id === id;
            });
            
            if (!capsule) {
                openingLoader.classList.remove('show');
                showError('Capsule not found');
                return;
            }

            const isUnlocked = isDateUnlocked(capsule.unlockDate);

            // Hide opening loader
            setTimeout(function() {
                openingLoader.classList.remove('show');
                
                if (capsule.hasPassword) {
                    promptPassword(capsule, isUnlocked);
                } else {
                    displayCapsuleContent(capsule, isUnlocked);
                }
            }, 100);
        } catch (e) {
            console.error('❌ Error opening capsule:', e);
            openingLoader.classList.remove('show');
            showError('Error opening capsule');
        }
    }, 1800);
}

function promptPassword(capsule, isUnlocked) {
    let content = '<div style="text-align: center;">' +
        '<div style="font-size: 4rem; margin-bottom: 20px;">🔐</div>' +
        '<h2 style="margin-bottom: 20px;">' + escapeHtml(capsule.title) + '</h2>' +
        '<div style="background: rgba(220, 38, 38, 0.15); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(220, 38, 38, 0.3);">' +
        '<h3 style="color: #fca5a5;">🔒 Password Protected</h3>' +
        '<p style="color: #d1d5db; margin-top: 10px;">Enter the password you set when creating this capsule.</p>' +
        '</div>' +
        '<div style="margin: 20px 0;">' +
        '<input type="password" id="passwordInput" placeholder="Enter password..." style="width: 100%; padding: 12px 15px; border: 2px solid rgba(60, 60, 60, 0.8); border-radius: 10px; background: rgba(15, 15, 15, 0.9); color: #f0f0f0; font-size: 1rem;">' +
        '</div>' +
        '<button class="btn btn-primary" onclick="verifyPassword(' + capsule.id + ', ' + isUnlocked + ')" style="width: 100%; margin-top: 10px;">Unlock Capsule</button>' +
        '<p id="passwordError" style="color: #ef4444; margin-top: 15px; display: none;">❌ Incorrect password. Please try again.</p>' +
        '</div>';
    
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('capsuleModal').classList.add('active');
    
    setTimeout(function() {
        const input = document.getElementById('passwordInput');
        if (input) {
            input.focus();
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyPassword(capsule.id, isUnlocked);
                }
            });
        }
    }, 100);
}

function verifyPassword(id, isUnlocked) {
    const capsule = capsules.find(function(c) {
        return c.id === id;
    });
    if (!capsule) return;

    const enteredPassword = document.getElementById('passwordInput').value;

    if (enteredPassword === capsule.password) {
        displayCapsuleContent(capsule, isUnlocked);
    } else {
        const errorElement = document.getElementById('passwordError');
        if (errorElement) {
            errorElement.style.display = 'block';
        }
        const input = document.getElementById('passwordInput');
        if (input) {
            input.style.animation = 'shake 0.5s';
            input.value = '';
            setTimeout(function() {
                input.style.animation = '';
                input.focus();
            }, 500);
        }
    }
}

function displayCapsuleContent(capsule, isUnlocked) {
    const icon = getTypeIcon(capsule.type);

    let content = '<div style="text-align: center;">' +
        '<div style="font-size: 4rem; margin-bottom: 20px;">' + icon + '</div>' +
        '<h2 style="margin-bottom: 20px;">' + escapeHtml(capsule.title) + '</h2>' +
        (capsule.customType ? '<div style="color: #ef4444; font-size: 1rem; margin-bottom: 15px; font-weight: 600;">Type: ' + escapeHtml(capsule.type) + '</div>' : '');

    if (isUnlocked) {
        content += '<div style="background: rgba(34, 197, 94, 0.15); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(34, 197, 94, 0.3);">' +
            '<h3 style="color: #86efac;">🎉 Time Capsule Unlocked!</h3>' +
            '<p style="color: #d1d5db; margin-top: 5px; font-size: 0.9rem;">Unlocked on ' + formatDate(capsule.unlockDate) + '</p>' +
            (capsule.hasPassword ? '<p style="color: #86efac; margin-top: 5px; font-size: 0.85rem;">🔐 Password Verified</p>' : '') +
            (capsule.recipientEmail ? '<p style="color: #60a5fa; margin-top: 5px; font-size: 0.85rem;">📧 Shared with: ' + escapeHtml(capsule.recipientEmail) + '</p>' : '') +
            '</div>';

        if (capsule.message) {
            content += '<div style="text-align: left; background: rgba(30, 30, 30, 0.9); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(60, 60, 60, 0.5);">' +
                '<h4 style="margin-bottom: 10px; color: #d1d5db;">📝 Your Message:</h4>' +
                '<p style="line-height: 1.6; color: #f0f0f0; white-space: pre-wrap;">' + escapeHtml(capsule.message) + '</p>' +
                '</div>';
        }
        
        if (capsule.predictions) {
            content += '<div style="text-align: left; background: rgba(30, 30, 30, 0.9); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(60, 60, 60, 0.5);">' +
                '<h4 style="margin-bottom: 10px; color: #d1d5db;">🔮 Your Predictions:</h4>' +
                '<p style="line-height: 1.6; color: #f0f0f0; white-space: pre-wrap;">' + escapeHtml(capsule.predictions) + '</p>' +
                '</div>';
        }

        content += '<div style="text-align: left; background: rgba(30, 30, 30, 0.9); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(60, 60, 60, 0.5);">' +
            '<p style="color: #9ca3af; font-size: 0.85rem;">📅 Created: ' + formatDate(capsule.createdDate) + '</p>' +
            '</div>';

        if (capsule.recipientEmail) {
            content += '<button class="btn btn-secondary" onclick="shareViaEmail(' + capsule.id + ')" style="width: 100%; margin-bottom: 10px;">📧 Share via Email</button>';
        }

        content += '<div class="delete-btn-container">' +
            '<button class="btn btn-danger" onclick="deleteCapsule(' + capsule.id + ')" style="width: 100%;">🗑️ Delete Capsule</button>' +
            '</div>';
    } else {
        const countdown = getCountdown(capsule.unlockDate);
        content += '<div style="background: rgba(220, 38, 38, 0.15); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(220, 38, 38, 0.3);">' +
            '<h3 style="color: #fca5a5;">🔒 Still Locked</h3>' +
            '<p style="color: #d1d5db;">This capsule will unlock on ' + formatDate(capsule.unlockDate) + '</p>' +
            (capsule.hasPassword ? '<p style="color: #fca5a5; margin-top: 5px; font-size: 0.85rem;">🔐 Password Protected</p>' : '') +
            (capsule.recipientEmail ? '<p style="color: #60a5fa; margin-top: 5px; font-size: 0.85rem;">📧 Will notify: ' + escapeHtml(capsule.recipientEmail) + '</p>' : '') +
            '</div>' +
            '<h4 style="color: #d1d5db;">⏰ Time Remaining:</h4>' +
            '<div class="countdown">' +
            '<div class="countdown-item"><div class="countdown-value">' + countdown.years + '</div><div class="countdown-label">Years</div></div>' +
            '<div class="countdown-item"><div class="countdown-value">' + countdown.months + '</div><div class="countdown-label">Months</div></div>' +
            '<div class="countdown-item"><div class="countdown-value">' + countdown.days + '</div><div class="countdown-label">Days</div></div>' +
            '</div>' +
            '<div style="text-align: left; background: rgba(30, 30, 30, 0.9); padding: 15px; border-radius: 10px; margin-top: 20px; border: 1px solid rgba(60, 60, 60, 0.5);">' +
            '<p style="color: #9ca3af; font-size: 0.85rem;">📅 Created: ' + formatDate(capsule.createdDate) + '</p>' +
            '</div>' +
            '<div class="delete-btn-container">' +
            '<button class="btn btn-danger" onclick="deleteCapsule(' + capsule.id + ')" style="width: 100%;">🗑️ Delete Capsule</button>' +
            '</div>';
    }

    content += '</div>';
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('capsuleModal').classList.add('active');
}

function shareViaEmail(id) {
    const capsule = capsules.find(function(c) {
        return c.id === id;
    });
    
    if (!capsule || !capsule.recipientEmail) {
        showError('No email address found');
        return;
    }

    const subject = encodeURIComponent('Time Capsule: ' + capsule.title);
    const body = encodeURIComponent(
        'Hello!\n\nYou have received a Time Capsule message:\n\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '📦 Title: ' + capsule.title + '\n' +
        '📅 Unlock Date: ' + formatDate(capsule.unlockDate) + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n\n' +
        '📝 Message:\n' + capsule.message + '\n\n' +
        (capsule.predictions ? '🔮 Predictions:\n' + capsule.predictions + '\n\n' : '') +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        'Created on: ' + formatDate(capsule.createdDate) + '\n\n' +
        'This time capsule was created using TimeCapsule app ⏳'
    );

    window.open('mailto:' + capsule.recipientEmail + '?subject=' + subject + '&body=' + body, '_blank');
    
    capsule.notificationSent = true;
    saveCapsules();
    
    showSaveNotification();
}

function deleteCapsule(id) {
    if (confirm('⚠️ Are you sure you want to permanently delete this time capsule?\n\nThis action cannot be undone!')) {
        capsules = capsules.filter(function(c) {
            return c.id !== id;
        });
        
        if (saveCapsules()) {
            console.log('🗑️ Capsule deleted');
            closeModal();
            displayCapsules();
            updateCapsuleCount();
            
            const notification = document.getElementById('saveNotification');
            notification.innerHTML = '🗑️ Capsule deleted successfully';
            notification.classList.add('show');
            setTimeout(function() {
                notification.classList.remove('show');
                notification.innerHTML = '✓ Capsule saved successfully!';
            }, 3000);
        } else {
            showError('Failed to delete capsule');
        }
    }
}

function closeModal() {
    document.getElementById('capsuleModal').classList.remove('active');
}

function getTypeIcon(type) {
    const icons = {
        personal: '👤',
        family: '👨‍👩‍👧‍👦',
        community: '🌍',
        legacy: '💝'
    };
    return icons[type] || '⭐';
}

function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString;
    }
}

function getCountdown(unlockDate) {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock - now;

    if (diff <= 0) {
        return { years: 0, months: 0, days: 0 };
    }

    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const remainingAfterYears = diff % (1000 * 60 * 60 * 24 * 365.25);
    const months = Math.floor(remainingAfterYears / (1000 * 60 * 60 * 24 * 30.44));
    const remainingAfterMonths = remainingAfterYears % (1000 * 60 * 60 * 24 * 30.44);
    const days = Math.floor(remainingAfterMonths / (1000 * 60 * 60 * 24));

    return { years, months, days };
}

function checkUnlockedCapsules() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let unlockedCount = 0;
    
    capsules.forEach(function(capsule) {
        const unlockDate = new Date(capsule.unlockDate);
        unlockDate.setHours(0, 0, 0, 0);
        
        if (today >= unlockDate && !capsule.notificationSent) {
            unlockedCount++;
            showUnlockNotification(capsule);
            capsule.notificationSent = true;
        }
    });
    
    if (unlockedCount > 0) {
        saveCapsules();
    }
    
    return unlockedCount;
}

function showUnlockNotification(capsule) {
    const notification = document.getElementById('saveNotification');
    notification.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    notification.innerHTML = '🎉 "' + escapeHtml(capsule.title) + '" has unlocked! Click to view.';
    notification.style.cursor = 'pointer';
    notification.onclick = function() {
        openCapsule(capsule.id);
        notification.classList.remove('show');
    };
    notification.classList.add('show');
    
    sendBrowserNotification('🎉 Time Capsule Unlocked!', '"' + capsule.title + '" is now available to open!');
    
    setTimeout(function() {
        notification.classList.remove('show');
        notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        notification.innerHTML = '✓ Capsule saved successfully!';
        notification.style.cursor = 'default';
        notification.onclick = null;
    }, 10000);
}

function saveCapsules() {
    try {
        const data = JSON.stringify(capsules);
        localStorage.setItem(STORAGE_KEY, data);
        console.log('💾 Saved to localStorage:', capsules.length, 'capsules');
        return true;
    } catch (e) {
        console.error('❌ Error saving to localStorage:', e);
        showError('Storage error. Your data may not be saved.');
        return false;
    }
}

function loadCapsules() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                capsules = parsed.filter(function(c) {
                    return c.id && c.title && c.message && c.unlockDate && c.createdDate;
                });
                console.log('📂 Loaded from localStorage:', capsules.length, 'capsules');
                return;
            }
        }
        
        capsules = [];
        console.log('📂 No saved capsules found');
    } catch (e) {
        console.error('❌ Error loading capsules:', e);
        capsules = [];
    }
}

function updateCapsuleCount() {
    const countElement = document.getElementById('capsuleCount');
    if (countElement) {
        countElement.textContent = capsules.length;
    }
}

function showSaveNotification() {
    const notification = document.getElementById('saveNotification');
    notification.classList.add('show');
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}

function showError(message) {
    const notification = document.getElementById('errorNotification');
    notification.textContent = '⚠ ' + message;
    notification.classList.add('show');
    setTimeout(function() {
        notification.classList.remove('show');
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.onclick = function(event) {
    const modal = document.getElementById('capsuleModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('🔄 Page visible again, checking for unlocks...');
        loadCapsules();
        checkUnlockedCapsules();
        displayCapsules();
        updateCapsuleCount();
    }
});

setInterval(function() {
    console.log('⏰ Hourly check for unlocked capsules...');
    checkUnlockedCapsules();
    displayCapsules();
}, 3600000);