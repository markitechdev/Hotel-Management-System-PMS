<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Render, Railway and similar hosts terminate HTTPS at a proxy in front of the app.
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Database failures answer with a clear JSON message the React app shows inline,
        // without leaking connection details in production.
        $exceptions->render(function (QueryException|PDOException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            // Two clerks saving the same room number at the same moment: the unique index wins,
            // and the second clerk gets the normal validation message instead of a server error.
            if ($e instanceof UniqueConstraintViolationException) {
                return response()->json([
                    'message' => 'That room number is already in the inventory.',
                    'errors' => ['room_number' => ['That room number is already in the inventory.']],
                ], 422);
            }

            if (config('app.debug')) {
                return null;
            }

            return response()->json([
                'message' => 'The room database is unavailable right now. Try again shortly.',
            ], 503);
        });
    })->create();
