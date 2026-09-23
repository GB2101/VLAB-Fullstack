<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SolicitationController;

Route::fallback(function () {
    return response()->json(['message' => 'Resource not found'], 404);
});

Route::get('/teapot', function () {
    return response()->json(['message' => 'API is working'], 418);
});

Route::group(['prefix' => 'v1'], function () {
    $MissingID = function () {
        return response()->json(['message' => 'O ID da solicitação não foi encontrado'], 404);
    };


    Route::apiResource('solicitacoes', SolicitationController::class, [])
        ->parameters(['solicitacoes' => 'solicitation'])
        ->except(['update', 'destroy'])
        ->whereNumber('solicitation')
        ->missing($MissingID);

    Route::patch('/solicitacoes/{solicitation}/status', [SolicitationController::class, 'transition'])
        ->name('solicitacoes.patch')
        ->whereNumber('solicitation')
        ->missing($MissingID);

    Route::get('/solicitacoes/summary', [SolicitationController::class, 'summary'])->name('solicitacoes.summary');
});
