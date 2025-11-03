#!/bin/bash

ENV_FILE=".env"
TEMPLATE_FILE=".env.example"

if [ -f "$ENV_FILE" ]; then
  echo "⚠️ $ENV_FILE đã tồn tại, bỏ qua tạo mới"
else
  cp "$TEMPLATE_FILE" "$ENV_FILE"
  echo "✅ $ENV_FILE đã được tạo từ $TEMPLATE_FILE"
fi
