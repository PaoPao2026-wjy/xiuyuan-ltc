// HiMorning应用原型稿 JavaScript

// 全局变量
let currentTheme = 'sunrise';
let selectedTheme = 'sunrise';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 初始化主题系统
    initThemeSystem();
    
    // 初始化底部导航
    initBottomNavigation();
    
    // 初始化早晚打卡页功能
    initCheckinPage();
    
    // 初始化热点内容页功能
    initNewsPage();
    
    // 初始化AI心语页功能
    initAIChatPage();
    
    // 初始化个人中心页功能
    initProfilePage();
    
    // 添加动画效果
    addAnimationEffects();
}

// ===== 底部导航功能 =====
function initBottomNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPageId = this.getAttribute('data-page');
            
            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // 切换页面
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPageId).classList.add('active');
            
            // 添加页面切换动画
            const activePage = document.getElementById(targetPageId);
            activePage.style.opacity = '0';
            activePage.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                activePage.style.transition = 'all 0.3s ease';
                activePage.style.opacity = '1';
                activePage.style.transform = 'translateY(0)';
            }, 10);
        });
    });
}

// ===== 早晚打卡页功能 =====
function initCheckinPage() {
    // 上传图片功能
    const uploadArea = document.querySelector('.upload-placeholder');
    const fileInput = document.getElementById('photo-upload');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadArea.innerHTML = `
                        <img src="${e.target.result}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                        <p style="margin-top: 12px;">点击更换图片</p>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 心语输入字数统计
    const textarea = document.querySelector('.textarea-field');
    const charCount = document.querySelector('.char-count');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count}/200`;
            
            if (count > 180) {
                charCount.style.color = 'var(--sunrise-orange)';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });
    }
    
    // 心情选择功能
    const moodOptions = document.querySelectorAll('.mood-option');
    
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // 完成打卡按钮
    const completeBtn = document.querySelector('.complete-checkin');
    
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            // 简单的完成动画
            this.textContent = '✅ 打卡成功！';
            this.style.background = 'var(--morning-blue)';
            
            setTimeout(() => {
                this.textContent = '✨ 完成打卡';
                this.style.background = '';
                showToast('打卡成功！继续保持哦～');
            }, 2000);
        });
    }
    
    // 历史记录折叠功能在全局函数中定义
}

// 历史记录折叠功能（全局函数，因为HTML中直接调用）
function toggleHistory() {
    const historyContent = document.querySelector('.history-content');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    if (historyContent.style.display === 'none') {
        historyContent.style.display = 'block';
        toggleIcon.classList.add('rotated');
        historyContent.style.animation = 'slideUp 0.3s ease-out';
    } else {
        historyContent.style.display = 'none';
        toggleIcon.classList.remove('rotated');
    }
}

// ===== 热点内容页功能 =====
function initNewsPage() {
    // 分类筛选功能
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 这里可以添加实际的筛选逻辑
            showToast(`切换到：${this.textContent}`);
        });
    });
    
    // 新闻卡片点击功能
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.news-title').textContent;
            showToast(`正在打开：${title}`);
            
            // 这里可以添加跳转到详情页的逻辑
        });
    });
}

// ===== AI心语页功能 =====
function initAIChatPage() {
    // AI角色切换功能
    const characterBtns = document.querySelectorAll('.character-btn');
    
    characterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            characterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const characterName = this.querySelector('.character-name').textContent;
            const characterAvatar = this.querySelector('.character-avatar').textContent;
            
            // 更新聊天界面的AI头像
            const aiAvatars = document.querySelectorAll('.ai-message .message-avatar');
            aiAvatars.forEach(avatar => {
                avatar.textContent = characterAvatar;
            });
            
            showToast(`切换到：${characterName}`);
        });
    });
    
    // 聊天输入功能
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const voiceBtn = document.querySelector('.voice-btn');
    const chatMessages = document.querySelector('.chat-messages');
    
    if (chatInput && sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            showToast('语音功能开发中...');
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // 添加用户消息
        addMessage(message, 'user');
        chatInput.value = '';
        
        // 模拟AI回复
        setTimeout(() => {
            const aiReplies = [
                '我理解你的感受，让我们一起来聊聊吧 😊',
                '听起来很有趣！能告诉我更多吗？',
                '你说得很对，这确实值得思考。',
                '我觉得你的想法很棒！继续保持这种积极的心态。',
                '有时候分享自己的感受真的很重要呢 🤗'
            ];
            const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
            addMessage(randomReply, 'ai');
        }, 1000);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message slide-up`;
        
        if (sender === 'ai') {
            const currentAvatar = document.querySelector('.character-btn.active .character-avatar').textContent;
            messageDiv.innerHTML = `
                <div class="message-avatar">${currentAvatar}</div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ===== 个人中心页功能 =====
function initProfilePage() {
    // 设置项点击功能（排除偏好主题）
    const settingItems = document.querySelectorAll('.setting-item');
    
    settingItems.forEach(item => {
        const settingTitle = item.querySelector('h4').textContent;
        
        // 偏好主题和分享成长有专门的处理函数，跳过
        if (settingTitle === '偏好主题' || settingTitle === '分享成长') {
            return;
        }
        
        item.addEventListener('click', function() {
            showToast(`正在打开：${settingTitle}`);
        });
    });
    
    // 用户信息编辑功能（简单演示）
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.addEventListener('click', function() {
            const newName = prompt('请输入新的昵称：', this.textContent);
            if (newName && newName.trim()) {
                this.textContent = newName.trim();
                showToast('昵称已更新！');
            }
        });
    }
}

// ===== 工具函数 =====

// 显示提示消息
function showToast(message) {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// 添加动画效果
function addAnimationEffects() {
    // 为所有卡片添加悬停效果
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 页面滚动时的动画效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察所有带有slide-up类的元素
    const slideUpElements = document.querySelectorAll('.slide-up');
    slideUpElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// 添加fadeOut动画的CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
        }
    }
`;
document.head.appendChild(style);

// ===== 主题系统功能 =====
function initThemeSystem() {
    // 从本地存储加载主题
    const savedTheme = localStorage.getItem('app-theme') || 'sunrise';
    currentTheme = savedTheme;
    selectedTheme = savedTheme;
    
    // 应用保存的主题
    applyThemeToDocument(currentTheme);
    
    // 更新主题选择器的状态
    updateThemeSelector();
}

function openThemeSelector() {
    const modal = document.getElementById('theme-modal');
    modal.classList.add('show');
    
    // 重置选择状态为当前主题
    selectedTheme = currentTheme;
    updateThemeSelector();
    
    // 添加点击背景关闭功能
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeThemeSelector();
        }
    });
}

function closeThemeSelector() {
    const modal = document.getElementById('theme-modal');
    modal.classList.remove('show');
    
    // 重置选择状态
    selectedTheme = currentTheme;
    updateThemeSelector();
}

function selectTheme(theme) {
    selectedTheme = theme;
    updateThemeSelector();
    
    // 实时预览主题效果
    applyThemeToDocument(theme);
}

function applyTheme() {
    currentTheme = selectedTheme;
    
    // 保存到本地存储
    localStorage.setItem('app-theme', currentTheme);
    
    // 应用主题
    applyThemeToDocument(currentTheme);
    
    // 关闭弹窗
    closeThemeSelector();
    
    // 显示成功提示
    showToast(`🎨 已切换到${getThemeName(currentTheme)}主题`);
}

function applyThemeToDocument(theme) {
    // 设置文档的主题属性
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新个人中心页的主题描述
    updateThemeDescription(theme);
}

function updateThemeSelector() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        const themeType = option.getAttribute('data-theme');
        if (themeType === selectedTheme) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function updateThemeDescription(theme) {
    const themeDescriptions = {
        'sunrise': '当前主题：日出橙 - 温暖活力',
        'morning': '当前主题：晨雾蓝 - 宁静舒缓',
        'almond': '当前主题：杏仁米 - 自然温柔',
        'purple': '当前主题：静谧紫 - 优雅神秘',
        'sunset': '当前主题：落日粉 - 浪漫温柔'
    };
    
    const themeSettingDesc = document.querySelector('.setting-item .setting-content p');
    if (themeSettingDesc && themeSettingDesc.textContent.includes('选择你喜欢的界面主题')) {
        themeSettingDesc.textContent = themeDescriptions[theme] || '选择你喜欢的界面主题';
    }
}

function getThemeName(theme) {
    const themeNames = {
        'sunrise': '日出橙',
        'morning': '晨雾蓝',
        'almond': '杏仁米',
        'purple': '静谧紫',
        'sunset': '落日粉'
    };
    
    return themeNames[theme] || '默认';
}

// 主题切换的键盘快捷键支持（可选）
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + T 快速打开主题选择器
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        if (document.getElementById('theme-modal').classList.contains('show')) {
            closeThemeSelector();
        } else {
            openThemeSelector();
        }
    }
    
    // ESC 键关闭主题选择器
    if (e.key === 'Escape') {
        if (document.getElementById('theme-modal').classList.contains('show')) {
            closeThemeSelector();
        }
        if (document.getElementById('share-growth-modal').classList.contains('show')) {
            closeShareGrowthDialog();
        }
        if (document.getElementById('poster-generator-modal').classList.contains('show')) {
            closePosterGenerator();
        }
    }
});

// ===== 分享成长功能 =====
function openShareGrowthDialog() {
    const modal = document.getElementById('share-growth-modal');
    modal.classList.add('show');
    
    // 添加点击背景关闭功能
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeShareGrowthDialog();
        }
    });
}

function closeShareGrowthDialog() {
    const modal = document.getElementById('share-growth-modal');
    modal.classList.remove('show');
}

// 制作成长海报
function createGrowthPoster() {
    closeShareGrowthDialog();
    const posterModal = document.getElementById('poster-generator-modal');
    posterModal.classList.add('show');
    
    // 初始化模板选择
    initTemplateSelection();
    
    // 添加点击背景关闭功能
    posterModal.addEventListener('click', function(e) {
        if (e.target === posterModal) {
            closePosterGenerator();
        }
    });
}

// 数据洞察报告
function createDataReport() {
    closeShareGrowthDialog();
    showToast('正在生成数据报告...');
    
    // 模拟生成过程
    setTimeout(() => {
        showToast('📊 数据报告已生成！');
        // 这里可以跳转到报告页面或显示报告内容
    }, 2000);
}

// 美好时光相册
function createPhotoAlbum() {
    closeShareGrowthDialog();
    showToast('正在整理照片相册...');
    
    // 模拟生成过程
    setTimeout(() => {
        showToast('📱 相册已创建，共包含12张美好时光！');
        // 这里可以跳转到相册页面
    }, 2500);
}

// 生成分享链接
function generateShareLink() {
    closeShareGrowthDialog();
    showToast('正在生成专属链接...');
    
    // 模拟生成过程
    setTimeout(() => {
        const shareLink = 'https://zhaomuxinyu.com/share/user123';
        
        // 尝试复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareLink).then(() => {
                showToast('🔗 专属链接已复制到剪贴板！');
            }).catch(() => {
                showToast('🔗 专属链接已生成：' + shareLink);
            });
        } else {
            showToast('🔗 专属链接已生成：' + shareLink);
        }
    }, 1500);
}

// 云端备份
function backupToCloud() {
    closeShareGrowthDialog();
    showToast('正在备份到云端...');
    
    // 模拟备份过程
    setTimeout(() => {
        showToast('☁️ 数据已安全备份到云端！');
    }, 3000);
}

// 分享最近制作的内容
function shareRecent(type) {
    const shareTexts = {
        'report': '分享我的12月成长报告',
        'poster': '分享我的冬日心情海报'
    };
    
    showToast(`正在${shareTexts[type]}...`);
    
    setTimeout(() => {
        showToast('📤 分享成功！朋友们可以看到你的成长啦～');
    }, 1000);
}

// ===== 成长海报生成器功能 =====
function closePosterGenerator() {
    const modal = document.getElementById('poster-generator-modal');
    modal.classList.remove('show');
}

function backToShareOptions() {
    closePosterGenerator();
    openShareGrowthDialog();
}

// 初始化模板选择
function initTemplateSelection() {
    const templateItems = document.querySelectorAll('.template-item');
    
    templateItems.forEach(item => {
        item.addEventListener('click', function() {
            templateItems.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const templateType = this.getAttribute('data-template');
            showToast(`已选择${this.querySelector('.template-name').textContent}模板`);
        });
    });
}

// 预览海报
function previewPoster() {
    const activeTemplate = document.querySelector('.template-item.active');
    const templateName = activeTemplate.querySelector('.template-name').textContent;
    
    showToast(`正在预览${templateName}海报...`);
    
    // 模拟预览过程
    setTimeout(() => {
        showToast('✨ 预览效果很棒！可以生成海报了');
        // 这里可以显示预览界面
    }, 1500);
}

// 生成海报
function generatePoster() {
    const activeTemplate = document.querySelector('.template-item.active');
    const templateName = activeTemplate.querySelector('.template-name').textContent;
    const timeRange = document.querySelector('.custom-select').value;
    
    showToast(`正在生成${templateName}海报...`);
    
    // 模拟生成过程
    setTimeout(() => {
        showToast('🎉 海报生成成功！已保存到相册');
        closePosterGenerator();
        
        // 显示分享选项
        setTimeout(() => {
            if (confirm('海报已生成，是否立即分享到朋友圈？')) {
                showToast('📱 正在打开微信分享...');
            }
        }, 1000);
    }, 3000);
} 