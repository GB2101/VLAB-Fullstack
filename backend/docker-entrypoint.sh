#!/bin/sh
set -e

if [ -f /run/secrets/vlab_key ]; then
	export DB_PASSWORD="$(cat /run/secrets/vlab_key)"
fi

echo "Aguardando o banco de dados e aplicando migrations..."
until php artisan migrate --force; do
	echo "Banco de dados indisponível, tentando novamente em 2s..."
	sleep 2
done

echo "Executando seeders..."
php artisan db:seed --class=SolicitationSeeder --force

echo "Iniciando o servidor..."
exec php artisan serve --host=0.0.0.0 --port=8000
