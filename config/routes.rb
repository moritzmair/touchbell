# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  resources :bells
  get '/ringring/:id' => 'bells#ringring'
  root to: 'welcome#home'
end
