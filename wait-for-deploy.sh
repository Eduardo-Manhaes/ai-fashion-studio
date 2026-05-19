#!/bin/bash

# Bypass SSL
export NODE_TLS_REJECT_UNAUTHORIZED=0

URL="https://web-production-6ab20.up.railway.app/api/landing-data"
MAX_ATTEMPTS=30

echo "⏳ Aguardando deploy do Railway..."
echo ""

attempt=1
until [ $attempt -gt $MAX_ATTEMPTS ]; do
  response=$(curl -s "$URL" 2>/dev/null)

  if [ $? -eq 0 ]; then
    video_count=$(echo "$response" | grep -o '"generation_type"' | wc -l)

    if [ "$video_count" -eq 2 ]; then
      echo "✅ Deploy concluído! Endpoint retornando 2 vídeos."
      exit 0
    elif [ "$video_count" -eq 4 ]; then
      echo "⏳ Tentativa $attempt/$MAX_ATTEMPTS - ainda retornando 4 vídeos (deploy anterior)..."
    else
      echo "⏳ Tentativa $attempt/$MAX_ATTEMPTS - verificando..."
    fi
  else
    echo "⏳ Tentativa $attempt/$MAX_ATTEMPTS - servidor indisponível..."
  fi

  sleep 3
  attempt=$((attempt + 1))
done

echo "❌ Timeout: deploy não concluído após ${MAX_ATTEMPTS} tentativas"
exit 1
