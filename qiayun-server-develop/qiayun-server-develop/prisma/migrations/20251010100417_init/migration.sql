-- CreateTable
CREATE TABLE `admin_users` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `real_name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'STAFF') NOT NULL,
    `avatar` VARCHAR(200) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `admin_users_username_key`(`username`),
    UNIQUE INDEX `admin_users_phone_key`(`phone`),
    UNIQUE INDEX `admin_users_email_key`(`email`),
    INDEX `idx_admin_phone`(`phone`),
    INDEX `idx_admin_role_status`(`role`, `status`),
    INDEX `idx_admin_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wechat_users` (
    `wechat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `openid` VARCHAR(100) NOT NULL,
    `unionid` VARCHAR(100) NULL,
    `nickname` VARCHAR(100) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `phone` VARCHAR(20) NULL,
    `country` VARCHAR(50) NULL,
    `province` VARCHAR(50) NULL,
    `city` VARCHAR(50) NULL,
    `language` VARCHAR(20) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `wechat_users_openid_key`(`openid`),
    UNIQUE INDEX `wechat_users_unionid_key`(`unionid`),
    UNIQUE INDEX `wechat_users_phone_key`(`phone`),
    INDEX `idx_wechat_phone`(`phone`),
    INDEX `idx_wechat_openid`(`openid`),
    INDEX `idx_wechat_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`wechat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `technicians` (
    `technician_id` INTEGER NOT NULL AUTO_INCREMENT,
    `wechat_id` INTEGER NOT NULL,
    `real_name` VARCHAR(50) NULL,
    `phone` VARCHAR(20) NULL,
    `skills` JSON NULL,
    `certificates` JSON NULL,
    `experience_years` INTEGER NULL DEFAULT 0,
    `rating` DECIMAL(3, 2) NULL DEFAULT 5.0,
    `total_orders` INTEGER NOT NULL DEFAULT 0,
    `completed_orders` INTEGER NOT NULL DEFAULT 0,
    `work_status` ENUM('AVAILABLE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
    `location_lat` DECIMAL(10, 6) NULL,
    `location_lng` DECIMAL(10, 6) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `technicians_wechat_id_key`(`wechat_id`),
    INDEX `idx_tech_wechat_id`(`wechat_id`),
    INDEX `idx_tech_phone`(`phone`),
    INDEX `idx_tech_work_status`(`work_status`, `status`),
    INDEX `idx_tech_location`(`location_lat`, `location_lng`),
    INDEX `idx_tech_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`technician_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enterprises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,
    `enterpriseName` VARCHAR(255) NOT NULL,
    `enterpriseType` ENUM('STATE_OWNED', 'PRIVATE', 'FOREIGN', 'JOINT_VENTURE') NOT NULL,
    `enterpriseAddress` VARCHAR(255) NOT NULL,
    `contactPhone` VARCHAR(50) NOT NULL,
    `enterpriseEmail` VARCHAR(100) NULL,
    `contactName` VARCHAR(50) NOT NULL,
    `contactPosition` VARCHAR(50) NOT NULL,
    `contactMobile` VARCHAR(50) NOT NULL,
    `contactEmail` VARCHAR(100) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_enterprise_name`(`enterpriseName`),
    INDEX `idx_enterprise_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_template_created_by`(`created_by`),
    INDEX `idx_template_name`(`name`),
    INDEX `idx_template_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspection_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `template_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_inspection_template`(`template_id`),
    INDEX `idx_inspection_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operation_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('BOOLEAN', 'TEXT', 'SELECT') NOT NULL,
    `options` JSON NULL,
    `inspection_item_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_operation_inspection`(`inspection_item_id`),
    INDEX `idx_operation_type`(`type`),
    INDEX `idx_operation_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('REPAIR', 'MAINTENANCE', 'INSPECTION') NOT NULL,
    `estimated_hours` INTEGER NOT NULL,
    `priority` ENUM('URGENT', 'NORMAL', 'LOW') NOT NULL,
    `enterprise_id` INTEGER NOT NULL,
    `contact_phone` VARCHAR(50) NOT NULL,
    `work_address` TEXT NOT NULL,
    `description_type` VARCHAR(191) NOT NULL,
    `custom_description` TEXT NULL,
    `selected_template_items` JSON NULL,
    `draft_id` INTEGER NULL,
    `specific_requirements` TEXT NULL,
    `planned_start_time` DATETIME(3) NULL,
    `planned_end_time` DATETIME(3) NULL,
    `special_requirements` JSON NULL,
    `remarks` TEXT NULL,
    `status` ENUM('DRAFT', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `work_orders_order_no_key`(`order_no`),
    UNIQUE INDEX `work_orders_draft_id_key`(`draft_id`),
    INDEX `idx_workorder_order_no`(`order_no`),
    INDEX `idx_workorder_enterprise`(`enterprise_id`),
    INDEX `idx_workorder_creator`(`created_by`),
    INDEX `idx_workorder_status`(`status`),
    INDEX `idx_workorder_draft`(`draft_id`),
    INDEX `idx_workorder_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_order_drafts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('REPAIR', 'MAINTENANCE', 'INSPECTION') NOT NULL,
    `estimated_hours` INTEGER NOT NULL,
    `priority` ENUM('URGENT', 'NORMAL', 'LOW') NOT NULL,
    `enterprise_id` INTEGER NOT NULL,
    `contact_phone` VARCHAR(50) NOT NULL,
    `work_address` TEXT NOT NULL,
    `description_type` VARCHAR(191) NOT NULL,
    `custom_description` TEXT NULL,
    `selected_template_items` JSON NULL,
    `specific_requirements` TEXT NULL,
    `planned_start_time` DATETIME(3) NULL,
    `planned_end_time` DATETIME(3) NULL,
    `special_requirements` JSON NULL,
    `remarks` TEXT NULL,
    `draft_status` ENUM('PENDING_SUBMIT', 'GENERATED', 'INVALID') NOT NULL DEFAULT 'PENDING_SUBMIT',
    `work_order_id` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `work_order_drafts_work_order_id_key`(`work_order_id`),
    INDEX `idx_draft_enterprise`(`enterprise_id`),
    INDEX `idx_draft_creator`(`created_by`),
    INDEX `idx_draft_status`(`draft_status`),
    INDEX `idx_draft_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_order_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `work_order_id` INTEGER NOT NULL,
    `technician_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `assigned_by` INTEGER NOT NULL,
    `remark` TEXT NULL,
    `handled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_assignment_order_status`(`work_order_id`, `status`),
    INDEX `idx_assignment_tech_status`(`technician_id`, `status`),
    INDEX `idx_assignment_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_order_technicians` (
    `work_order_id` INTEGER NOT NULL,
    `technician_id` INTEGER NOT NULL,
    `processing_status` ENUM('PROCESSING', 'COMPLETED', 'PAUSED') NOT NULL DEFAULT 'PROCESSING',
    `processing_result` JSON NULL,
    `processing_images` JSON NULL,
    `processing_videos` JSON NULL,
    `start_time` DATETIME(3) NULL,
    `complete_time` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_order_tech_process_status`(`work_order_id`, `processing_status`),
    INDEX `idx_order_tech_deleted`(`is_deleted`, `deleted_at`),
    PRIMARY KEY (`work_order_id`, `technician_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `technicians` ADD CONSTRAINT `fk_tech_wechat` FOREIGN KEY (`wechat_id`) REFERENCES `wechat_users`(`wechat_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_templates` ADD CONSTRAINT `maintenance_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspection_items` ADD CONSTRAINT `inspection_items_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `maintenance_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operation_items` ADD CONSTRAINT `operation_items_inspection_item_id_fkey` FOREIGN KEY (`inspection_item_id`) REFERENCES `inspection_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_enterprise_id_fkey` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_drafts` ADD CONSTRAINT `work_order_drafts_enterprise_id_fkey` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_drafts` ADD CONSTRAINT `work_order_drafts_work_order_id_fkey` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_drafts` ADD CONSTRAINT `work_order_drafts_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_assignments` ADD CONSTRAINT `fk_assignment_workorder` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_assignments` ADD CONSTRAINT `fk_assignment_technician` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`technician_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_assignments` ADD CONSTRAINT `work_order_assignments_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `admin_users`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_technicians` ADD CONSTRAINT `fk_tech_workorder` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_technicians` ADD CONSTRAINT `fk_tech_technician` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`technician_id`) ON DELETE CASCADE ON UPDATE CASCADE;
