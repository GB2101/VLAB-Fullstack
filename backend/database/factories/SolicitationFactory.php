<?php

namespace Database\Factories;

use App\Models\Solicitation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Solicitation>
 */
class SolicitationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $this->faker = \Faker\Factory::create('pt_BR'); // Set locale to Brazilian Portuguese

        $priority = $this->faker->randomElement(['BAIXA', 'MÉDIA', 'ALTA', 'URGENTE']);

        $createdAt = $this->faker->dateTimeBetween('-1 year', '-1 day');
        $updatedAt = $this->faker->dateTimeBetween($createdAt, 'now');

        return [
            'protocolo' => $this->faker->unique()->numerify('P-####'),
            'nome_solicitante' => $this->faker->name(),
            'categoria' => $this->faker->randomElement(['CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO']),
            'prioridade' => $priority,
            'status' => $this->faker->randomElement(['RECEBIDA', 'EM_ANALISE', 'AGENDADA', 'CONCLUIDA', 'CANCELADA']),
            'descricao' => $this->faker->paragraph(),
            'justificativa_prioridade' => $priority === 'URGENTE' ? $this->faker->sentence() : null,
            'created_at' => $createdAt,
            'updated_at' => $updatedAt,
        ];
    }
}
