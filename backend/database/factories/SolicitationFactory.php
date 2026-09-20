<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;
use App\Models\Solicitation;

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

        $priority = $this->faker->randomElement(Priority::cases());
        $category = $this->faker->randomElement(Category::cases());
        $status = $this->faker->randomElement(Status::cases());

        $justification = $priority === Priority::Urgent ? $this->faker->sentence() : null;

        $createdAt = $this->faker->dateTimeBetween('-1 year', '-1 day');
        $updatedAt = $this->faker->dateTimeBetween($createdAt, 'now');

        $random = strtoupper($this->faker->unique->regexify('[A-Z0-9]{6}'));
        $protocol = substr($category->value, 0, 3) . '-' . date('ymd-') . $random;

        return [
            'protocolo' => $protocol,
            'nome_solicitante' => $this->faker->name(),
            'descricao' => $this->faker->paragraph(),
            'categoria' => $category,
            'prioridade' => $priority,
            'status' => $status,
            'justificativa_prioridade' => $justification,
            'created_at' => $createdAt,
            'updated_at' => $updatedAt,
        ];
    }
}
