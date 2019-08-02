# frozen_string_literal: true

class WelcomeController < ApplicationController
  def home
    @bells = Bell.where.not(enabled: false).all
    render layout: 'home'
  end
end
