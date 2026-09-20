<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SolicitationController;

Route::fallback(function () {
    return response()->json(['message' => 'Resource not found'], 404);
});

Route::group(['prefix' => 'v1'], function () {
    Route::get('/teapot', function () {
        return response()->json(['message' => 'API is working'], 418);
    });

    Route::apiResource('solicitacoes', SolicitationController::class, [])
        ->parameters(['solicitacoes' => 'solicitation'])
        ->missing(function () {
            return response()->json(['message' => 'O ID da solicitação não foi encontrado'], 404);
        });
});
