#!/bin/bash

# PM2 启动脚本 - qiayun-server
# 使用方法: ./pm2.sh [start|stop|restart|delete|logs|status]

APP_NAME="qiayun-server"
SCRIPT_PATH="dist/src/main.js"

case "$1" in
  start)
    echo "启动 ${APP_NAME}..."
    pm2 start ${SCRIPT_PATH} --name ${APP_NAME}
    ;;
  stop)
    echo "停止 ${APP_NAME}..."
    pm2 stop ${APP_NAME}
    ;;
  restart)
    echo "重启 ${APP_NAME}..."
    pm2 restart ${APP_NAME}
    ;;
  delete)
    echo "删除 ${APP_NAME}..."
    pm2 delete ${APP_NAME}
    ;;
  logs)
    echo "查看 ${APP_NAME} 日志..."
    pm2 logs ${APP_NAME}
    ;;
  status)
    echo "查看 ${APP_NAME} 状态..."
    pm2 show ${APP_NAME}
    ;;
  *)
    echo "使用方法: $0 {start|stop|restart|delete|logs|status}"
    exit 1
    ;;
esac

