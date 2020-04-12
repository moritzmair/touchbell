# frozen_string_literal: true

class AddRequestTypeAndBody < ActiveRecord::Migration[5.1]
  def change
    add_column :bells, :request_type, :string, default: 'GET'
    add_column :bells, :request_body, :string
    add_column :bells, :authorization_header, :string
  end
end
