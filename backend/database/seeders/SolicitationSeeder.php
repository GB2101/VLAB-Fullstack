<?php

namespace Database\Seeders;

use App\Models\Solicitation;
use Illuminate\Database\Seeder;

class SolicitationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Solicitation::exists()) {
            return;
        }

        Solicitation::factory()->count(300)->create();
    }
}
